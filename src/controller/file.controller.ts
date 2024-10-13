import { Request, Response } from "express";
import FileService from "service/file.service";
import { sendErrorResponse } from "utils/errorhandler";
import { GeneralResponse, sendApiResponse } from "utils/GeneralResponse";

export default class FileController {
  public static async getFileHandler(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const { fileName } = req.params;

      console.log("flieName", fileName);

      const path = FileService.uploadsDirectoryPath();

      const filePath = `${path}/${fileName}`;

      return res.status(200).sendFile(filePath);
    } catch (e) {
      return sendErrorResponse(res, e, {
        message: "Error while fetching file",
        status: 500,
      });
    }
  }
}
