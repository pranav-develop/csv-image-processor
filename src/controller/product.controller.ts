import InvalidFileError from "errors/InvalidFileError";
import { Request, Response } from "express";
import fileUpload from "express-fileupload";
import FileService from "service/file.service";
import JobService from "service/job.service";
import ProductService from "service/product.service";
import { JobTypes } from "types/JobTypes";
import { GeneralResponse, sendApiResponse } from "utils/GeneralResponse";

export default class ProductController {
  public static async uploadProductsCSVHandler(
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

      const products = await ProductService.createProductFromCSV({
        file: uploadedFile,
      });

      const job = await JobService.createJob({
        type: JobTypes.JobType.PRODUCTS_CSV,
        data: {
          file: uploadedFile,
          products,
        },
      });
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
}
