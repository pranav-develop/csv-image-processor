import csvParser from "csv-parser";
import fs from "fs";
import { ObjectType } from "types/GeneralTypes";

export default class CSVUtils {
  public static async parseCSVFile({
    filepath,
  }: {
    filepath: string;
  }): Promise<{
    headers: string[];
    rows: ObjectType[];
  }> {
    console.log("got file path", filepath);
    const headers: string[] = [];
    const results: ObjectType[] = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filepath)
        .pipe(csvParser())
        .on("headers", (headers) => {
          console.log("got headers", headers);
        })
        .on("data", (data: ObjectType) => results.push(data))
        .on("end", () => {
          resolve({
            headers: headers,
            rows: results,
          });
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }
}
