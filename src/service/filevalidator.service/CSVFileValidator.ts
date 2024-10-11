import fileUpload from "express-fileupload";
import FileValidator, { IFileValidatorOptions } from "./FileValidator";
import { FILE_MIME_TYPE } from "types/GeneralTypes";
import fs from "fs";
import csvParser from "csv-parser";
import InvalidFileError from "errors/InvalidFileError";

export default class CSVFileValidator extends FileValidator {
  static mimeType = FILE_MIME_TYPE.CSV;
  errors: string[] = [];

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private validateString(value: string): boolean {
    return typeof value === "string" && value.trim().length > 0;
  }

  private validateNumber(value: string): boolean {
    return !isNaN(Number(value));
  }

  private validateCSV(value: string): boolean {
    return value.split(",").length > 0;
  }

  private validateField({
    row,
    column,
    value,
    schema,
  }: {
    row: number;
    column: number;
    value: string;
    schema: ICSVRowSchema;
  }) {
    let isValid = false;

    switch (schema.type) {
      case "email":
        isValid = this.validateEmail(value);
        break;
      case "string":
        isValid = this.validateString(value);
        break;
      case "number":
        isValid = this.validateNumber(value);
        break;
      case "csv":
        isValid = this.validateCSV(value);
    }

    if (!isValid) {
      this.errors.push(
        `Invalid value for ${schema.header} at row ${row} and column ${column} expected ${schema.type}`
      );
    }
  }

  public validate({
    filepath,
    schema,
  }: IFileValidatorOptions<ICSVRowSchema>): Promise<void> {
    const expectedHeaders = schema.map((s) => s.header);
    return new Promise((resolve, reject) => {
      let rowCount = 0;
      fs.createReadStream(filepath)
        .pipe(csvParser())
        .on("headers", (headers) => {
          // Check if headers are as expected
          const missingHeaders = expectedHeaders.filter(
            (header) => !headers.includes(header)
          );
          if (missingHeaders.length > 0) {
            this.errors.push(`Missing headers ${missingHeaders.join(",")}`);
          }
        })
        .on("data", (row) => {
          rowCount++;
          schema.forEach((s, index) => {
            const value = row[s.header];
            if (!value && s.required) {
              this.errors.push(
                `Required field ${s.header} is missing at row ${rowCount}`
              );
            }
            if (value) {
              this.validateField({
                row: rowCount,
                column: index + 1,
                value,
                schema: s,
              });
            }
          });
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (err) => {
          this.errors.push(err.message);
          resolve();
        });
    });
  }
}

export interface ICSVRowSchema {
  header: string;
  type: "string" | "email" | "number" | "csv"; //csv is for comma separated values
  required: boolean;
}
