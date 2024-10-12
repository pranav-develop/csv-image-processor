import fs from "fs";
import { fetchClient } from "utils/fetchClient";
import FormData from "form-data";
import { IMAGIFY_API_KEY } from "env";
import { ImagifyAPIResponse } from "types/GeneralTypes";

export default class ImageProcessor {
  private percentage: number;
  private processType: ImageProcessAlgoType;

  constructor({ percentage, processType }: ImageProcessorOptions) {
    this.percentage = percentage;
    this.processType = processType;
  }

  private createFormData({ filePath }) {
    const formData = new FormData();
    formData.append("image", fs.createReadStream(filePath));
    formData.append(
      "data",
      JSON.stringify({
        resize: {
          percentage: this.percentage,
        },
        normal: this.processType === "normal",
        aggressive: this.processType === "aggressive",
        ultra: this.processType === "ultra",
      })
    );
    return formData;
  }

  private async makeProcessRequest(formData: FormData) {
    const imageData = await fetchClient<ImagifyAPIResponse>({
      url: "https://app.imagify.io/api/upload",
      method: "POST",
      headers: {
        Authorization: `token ${IMAGIFY_API_KEY}`,
        "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
      },
      payload: formData,
    });

    if (imageData.code !== 200) {
      switch (imageData.code) {
        case 422:
          throw new Error("ImageAlready Compressed");
        case 415:
          throw new Error("Invalid media format");
      }
    }
    return imageData;
  }

  public async processImage({
    imagePath,
  }: {
    imagePath: string;
  }): Promise<ImageProcessResponse> {
    try {
      // Check if the file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error("File not found");
      }

      //calling the process function
      const formData = this.createFormData({ filePath: imagePath });

      const processedImage = await this.makeProcessRequest(formData);
      return {
        success: true,
        message: "Image processed successfully",
        data: {
          processedImageUrl: processedImage.image,
        },
      };
    } catch (e) {
      return {
        success: false,
        message: `Failed to process image: ${e.message}`,
        data: null,
      };
    }
  }
}

export type ImageProcessAlgoType = "normal" | "aggressive" | "ultra";

export interface ImageProcessorOptions {
  processType: ImageProcessAlgoType;
  percentage: number;
}

export interface ImageProcessResponse {
  success: boolean;
  message: string;
  data: {
    processedImageUrl: string;
  } | null;
}
