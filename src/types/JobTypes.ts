import { Prisma, Product, UploadedFile } from "@prisma/client";

export namespace JobTypes {
  export enum JobType {
    PRODUCTS_CSV = "PRODUCTS_CSV",
  }

  interface GenericCreateJobInput {
    type: JobType;
  }

  export interface ProductsCSVCreateJobInput extends GenericCreateJobInput {
    type: JobType.PRODUCTS_CSV;
    data: {
      file: UploadedFile;
      products: Product[];
    };
  }

  export type CreateJobInput = ProductsCSVCreateJobInput;

  export type JobWithFiles = Prisma.JobGetPayload<{
    include: {
      requestFile: true;
      resultFile: true;
    };
  }>;
}
