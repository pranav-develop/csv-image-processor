import { Job, UploadedFile } from "@prisma/client";
import DBClient from "config/DBClient";
import CSVUtils from "utils/csv";
import path from "path";

export default class ProductService {
  public static async createProductFromCSV({ file }: { file: UploadedFile }) {
    const csvData = await CSVUtils.parseCSVFile({
      filepath: `${path.join(file.path, file.id)}.${file.extension}`,
    });

    const rawProductsData = csvData.rows.map((row) => {
      return {
        name: row["Product Name"],
        images: row["Input Image Urls"]
          .split(",")
          .filter((item: string) => item.length > 0),
      };
    });

    return Promise.all(
      rawProductsData.map((product) => {
        return this.createProduct(product);
      })
    );
  }

  public static async createProduct({
    name,
    images,
  }: {
    name: string;
    images: string[];
  }) {
    return DBClient.getInstance().$transaction(async (tx) => {
      const currentImages = await Promise.all(
        images.map((image) => {
          return tx.image.create({
            data: {
              originalUrl: image,
            },
          });
        })
      );
      return await tx.product.create({
        data: {
          name,
          images: {
            connect: currentImages.map((image) => {
              return { id: image.id };
            }),
          },
        },
      });
    });
  }
}
