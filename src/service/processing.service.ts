import { Image, Prisma } from "@prisma/client";
import FileService from "./file.service";
import fs from "fs";
import ImageProcessor from "utils/ImageProcesser";
import DBClient from "config/DBClient";

export default class ProcessingService {
  private async processImage({ image }: { image: Image }): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const downloadedImagePath = await FileService.downloadFile({
        url: image.originalUrl,
      });

      const imageProcessor = new ImageProcessor({
        percentage: 50,
        processType: "normal",
      });

      const processedImage = await imageProcessor.processImage({
        imagePath: downloadedImagePath,
      });

      if (!processedImage.success || !processedImage.data) {
        throw new Error(processedImage.message);
      }

      //updating image url in database
      await DBClient.getInstance().image.update({
        where: { id: image.id },
        data: {
          url: processedImage.data?.processedImageUrl,
        },
      });

      // Deleting the downloaded image
      // fs.unlinkSync(downloadedImagePath);
      return {
        success: true,
        message: "",
      };
    } catch (e) {
      // If not able process the image then replace url with original url
      await DBClient.getInstance().image.update({
        where: { id: image.id },
        data: {
          url: image.originalUrl,
        },
      });
      return {
        success: false,
        message: e.message,
      };
    }
  }

  public async processProductImages({
    productId,
  }: {
    productId: string;
  }): Promise<string[]> {
    const product = await DBClient.getInstance().product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) return [];

    // Processing the images
    const processedImages = await Promise.all(
      product.images.map((image) => this.processImage({ image }))
    );

    return processedImages.reduce((acc: string[], curr) => {
      if (!curr.success) {
        acc.push(curr.message);
      }
      return acc;
    }, []);
  }
}

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: {
    images: true;
  };
}>;
