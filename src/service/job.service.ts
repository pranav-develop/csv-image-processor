import { Job, JobStatus, UploadedFile } from "@prisma/client";
import DBClient from "config/DBClient";
import { JobTypes } from "types/JobTypes";
import ProcessingService from "./processing.service";
import WebhookService from "./webhook.service";
import path from "path";
import CSVUtils from "utils/csv";
import { ObjectType } from "types/GeneralTypes";
import FileService from "./file.service";

export default class JobService {
  private static async createJobResultFile({
    job,
    products,
  }: {
    job: JobTypes.JobWithFiles;
    products: JobTypes.CreateJobInput["data"]["products"];
  }): Promise<UploadedFile | null> {
    let resultFile: UploadedFile | null = null;

    try {
      if (!job.requestFile) return null;

      const csvData = await CSVUtils.parseCSVFile({
        filepath: `${path.join(job.requestFile.path, job.requestFile.id)}.${
          job.requestFile.extension
        }`,
      });

      const productsWithImages = await DBClient.getInstance().product.findMany({
        where: {
          id: {
            in: products.map((product) => product.id),
          },
        },
        include: {
          images: true,
        },
      });

      const originalToProcessedImageMapping = productsWithImages.reduce(
        (acc: ObjectType, curr) => {
          curr.images.forEach((image) => {
            acc[image.originalUrl] = image.url;
          });
          return acc;
        },
        {} as ObjectType
      );
      const updatedCsvResultData = {
        headers: [...csvData.headers, "Output Image Urls"],
        rows: csvData.rows.map((row) => {
          const images = row["Input Image Urls"].split(",").map((url) => {
            return originalToProcessedImageMapping[url] ?? url;
          });
          return {
            ...row,
            "Input Image Urls": `"${row["Input Image Urls"]}"`,
            "Output Image Urls": `"${images.join(",")}"`,
          };
        }),
      };

      resultFile = await DBClient.getInstance().uploadedFile.create({
        data: {
          extension: "csv",
          mimetype: "text/csv",
          originalName: `${job.id}_result.csv`,
          path: FileService.uploadsDirectoryPath(),
          size: 0,
        },
      });

      CSVUtils.createCSVFileFromJson({
        data: updatedCsvResultData,
        filename: resultFile.id,
        path: resultFile.path,
      });

      return resultFile;
    } catch (e) {
      if (resultFile) {
        await DBClient.getInstance().uploadedFile.delete({
          where: { id: resultFile.id },
        });
      }
      return null;
    }
  }

  private static async startJob(
    job: JobTypes.JobWithFiles,
    data: JobTypes.CreateJobInput["data"]
  ) {
    try {
      WebhookService.sendWebhookEvent({
        data: {
          jobId: job.id,
          requestJobFile: {
            id: job.requestFileId ? job.requestFileId : "",
            url: job.requestFile
              ? FileService.constructServableFilePath({ file: job.requestFile })
              : "",
          },
        },
        timestamp: Date.now(),
        topic: "JOB_STARTED",
      });

      // Updating the job status to IN_PROGRESS
      await DBClient.getInstance().job.update({
        where: { id: job.id },
        data: { status: JobStatus.IN_PROGRESS },
      });

      // Processing the job
      const processingResponses = await Promise.all(
        data.products.map(async (product) => {
          const processingService = new ProcessingService();
          return await processingService.processProductImages({
            productId: product.id,
          });
        })
      );

      const errors = processingResponses.reduce((acc: string[], curr) => {
        if (curr.length > 0) {
          acc.push(...curr);
        }
        return acc;
      }, []);

      if (errors.length > 0) {
        throw new Error(errors.join(" | "));
      }
      // TODO: creating and saving the result file
      const resultFile = await JobService.createJobResultFile({
        job,
        products: data.products,
      });

      // Updating the job status to COMPLETED
      await DBClient.getInstance().job.update({
        where: { id: job.id },
        data: { status: JobStatus.COMPLETED, requestFileId: resultFile?.id },
      });

      // Calling the job completed callback
      WebhookService.sendWebhookEvent({
        data: {
          jobId: job.id,
          status: "SUCCESS",
          errors: [],
          responseJobFile: {
            id: resultFile ? resultFile.id : "",
            url: resultFile
              ? FileService.constructServableFilePath({ file: resultFile })
              : "",
          },
        },
        timestamp: Date.now(),
        topic: "JOB_COMPLETED",
      });
    } catch (e) {
      console.log(e);
      // Saving the error status
      await DBClient.getInstance().job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          error: {
            message: e.message,
            stack: e.stack,
          },
        },
      });
      WebhookService.sendWebhookEvent({
        data: {
          jobId: job.id,
          status: "FAILED",
          errors: e.message.split(" | "),
          responseJobFile: null,
        },
        timestamp: Date.now(),
        topic: "JOB_COMPLETED",
      });
    }
  }

  public static async createJob(props: JobTypes.CreateJobInput) {
    // Creating job of type ProductCSVUpload as there is only one type of job
    const job = await DBClient.getInstance().job.create({
      data: {
        requestFileId: props.data.file.id,
        type: props.type,
      },
      include: {
        requestFile: true,
        resultFile: true,
      },
    });

    JobService.startJob(job, props.data);

    return job;
  }

  public static async getJobById({ id }: { id: string }) {
    return await DBClient.getInstance().job.findUnique({
      where: { id },
    });
  }
}
