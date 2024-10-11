import fileUpload from "express-fileupload";

declare namespace Express {
  export interface Request {
    files: fileUpload.FileArray | null | undefined;
  }
}
