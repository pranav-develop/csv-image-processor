import InvalidFileError from "errors/InvalidFileError";
import NotFoundError from "errors/NotFoundError";
import { Request, Response } from "express";
import fileUpload from "express-fileupload";
import CSVService from "service/csv.service";
import FileService from "service/file.service";
import JobService from "service/job.service";
import { GeneralResponse, sendApiResponse } from "utils/GeneralResponse";

export default class JobController {
  public static async createProcessingJobHandler(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const file = req.files?.datafile;
      if (!file || (file as fileUpload.UploadedFile[]).length) {
        throw new InvalidFileError("Please upload a valid CSV file");
      }

      const uploadedFile = await FileService.validateAndCreateFile({
        file: file as fileUpload.UploadedFile,
        allowedMimeTypes: ["text/csv"],
        maxSize: 1024 * 1024 * 2, // 2MB
        validateFile: true,
      });

      const job = await JobService.createJob({ file: uploadedFile });

      return sendApiResponse(
        res,
        new GeneralResponse({
          data: {
            jobId: job.id,
          },
          hasError: false,
          msg: "CSV file is valid",
        })
      );
    } catch (err) {
      console.log("got errror");
      console.error(err);
      return sendApiResponse(
        res,
        new GeneralResponse({
          data: null,
          hasError: true,
          status: 500,
          msg: "Internal Server Error",
        }),
        err
      );
    }
  }

  public static async checkJobStatusHandler(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      // Check the processing status
      const jobId = req.params.jobId;
      const job = await JobService.getJobById({ id: jobId });

      if (!job) {
        throw new NotFoundError(`No job Found with id: ${jobId}`);
      }

      return sendApiResponse(
        res,
        new GeneralResponse({
          data: {
            id: job.id,
            status: job.status,
            errors: job.error,
          },
          hasError: false,
          msg: "Job status fetched successfully",
        })
      );
    } catch (e) {
      console.error(e);
      return sendApiResponse(
        res,
        new GeneralResponse({
          data: null,
          hasError: true,
          msg: "Internal Server Error",
        })
      );
    }
  }
}
