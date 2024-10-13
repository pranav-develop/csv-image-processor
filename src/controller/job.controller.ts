import InvalidFileError from "errors/InvalidFileError";
import NotFoundError from "errors/NotFoundError";
import { Request, Response } from "express";
import fileUpload from "express-fileupload";
import FileService from "service/file.service";
import JobService from "service/job.service";
import ProductService from "service/product.service";
import { sendErrorResponse } from "utils/errorhandler";
import { GeneralResponse, sendApiResponse } from "utils/GeneralResponse";

export default class JobController {
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
      return sendErrorResponse(res, e);
    }
  }
}
