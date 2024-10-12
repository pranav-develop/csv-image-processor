import { UploadedFile } from "@prisma/client";
import DBClient from "config/DBClient";
import InvalidFileError from "errors/InvalidFileError";
import fileUpload from "express-fileupload";
import path from "path";
import { BASE_DIRECTORY } from "utils/constants";
import { getFileValidatorInstance } from "./filevalidator.service";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import fetch from "node-fetch";

export default class FileService {
  private static BASE_DIRECTORY = path.join(BASE_DIRECTORY, "src", "assets");
  private static UPLOADS_DIR = "uploads";
  private static TEMP_DIR = "temp";

  public static async downloadFile({ url }: { url: string }): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download file with url ${url}: ${response.statusText}`
      );
    }
    const buffer = await response.arrayBuffer();
    const fileName = path.basename(url);
    const filePath = path.join(this.BASE_DIRECTORY, this.TEMP_DIR, fileName);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log("file written to disk");
    return filePath;
  }

  private static async validateFile(file: fileUpload.UploadedFile) {
    // Saving file to temp disk to validate
    const fileExtension = file.mimetype.split("/")[1];
    const filePath = path.join(this.BASE_DIRECTORY, this.TEMP_DIR, uuidv4());
    const fileLocation = `${filePath}.${fileExtension}`;
    await file.mv(fileLocation);
    console.log("moved file to temp location", fileLocation);
    const validator = getFileValidatorInstance({
      mimeType: file.mimetype,
    });
    await validator.validate({
      filepath: fileLocation,
      schema: [
        {
          header: "S. No.",
          type: "number",
          required: true,
        },
        {
          header: "Product Name",
          type: "string",
          required: true,
        },
        {
          header: "Input Image Urls",
          type: "csv",
          required: true,
        },
      ],
    });
    // Deleting the file after validation
    // fs.unlinkSync(fileLocation);
    if (validator.errors.length > 0) {
      throw new InvalidFileError(validator.errors.join(" | "));
    }
  }

  /**
   *
   * @param file Any file
   * @param maxSize Maximum file size in bytes
   * @param allowedMimeTypes Allowed mime types eg. ["image/png", "image/jpeg"]
   *
   * @returns UploadedFile object
   */
  public static async validateAndCreateFile({
    file,
    maxSize,
    allowedMimeTypes,
    validateFile,
  }: {
    file: fileUpload.UploadedFile;
    maxSize?: number;
    allowedMimeTypes?: string[];
    validateFile?: true;
  }): Promise<UploadedFile> {
    let uploadedFile: UploadedFile | null = null;
    try {
      // Validate file size
      if (maxSize && file.size > maxSize) {
        throw new InvalidFileError("File size too large");
      }

      // Validate mime type
      if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
        throw new InvalidFileError("Mime Type not allowed");
      }

      if (validateFile) {
        await FileService.validateFile(file);
      }
      const filePath = path.join(this.BASE_DIRECTORY, FileService.UPLOADS_DIR);
      // Storing file in the uploads directory
      uploadedFile = await DBClient.getInstance().uploadedFile.create({
        data: {
          path: filePath,
          size: file.size,
          originalName: file.name,
          extension: file.mimetype.split("/")[1],
          mimetype: file.mimetype,
        },
      });

      // Move file to the uploads directory
      await file.mv(
        `${filePath}/${uploadedFile.id}.${file.mimetype.split("/")[1]}`
      );

      return uploadedFile;
    } catch (e) {
      // If file creation fails, delete the file from db and disk
      if (uploadedFile) {
        await DBClient.getInstance().uploadedFile.delete({
          where: {
            id: uploadedFile.id,
          },
        });
      }
      throw e;
    }
  }
}
