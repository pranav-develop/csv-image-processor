import { Job, JobStatus, UploadedFile } from "@prisma/client";
import DBClient from "config/DBClient";
import { JobTypes } from "types/JobTypes";
import ProcessingService from "./processing.service";

export default class JobService {
  private static async startJob(
    job: Job,
    data: JobTypes.CreateJobInput["data"]
  ) {
    try {
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

      // Updating the job status to COMPLETED
      await DBClient.getInstance().job.update({
        where: { id: job.id },
        data: { status: JobStatus.COMPLETED },
      });

      // Calling the job completed callback
      // TODO: Fire a webhook
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
    }
  }

  public static async createJob(props: JobTypes.CreateJobInput) {
    // Creating job of type ProductCSVUpload as there is only one type of job
    const job = await DBClient.getInstance().job.create({
      data: {
        requestFileId: props.data.file.id,
        type: props.type,
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
