import NotFoundError from "errors/NotFoundError";
import { Response } from "express";
import { GeneralResponse, sendApiResponse } from "./GeneralResponse";
import InvalidFileError from "errors/InvalidFileError";

export function sendErrorResponse(
  res: Response,
  error: Error,
  options?: {
    status?: number;
    message?: string;
  }
) {
  if (error instanceof NotFoundError) {
    return sendApiResponse(
      res,
      new GeneralResponse({
        status: 404,
        hasError: true,
        data: null,
        msg: error.message,
      })
    );
  }
  if (error instanceof InvalidFileError) {
    return sendApiResponse(
      res,
      new GeneralResponse({
        status: 400,
        hasError: true,
        data: null,
        msg: error.message,
      })
    );
  }
  return sendApiResponse(
    res,
    new GeneralResponse({
      status: options?.status || 500,
      hasError: true,
      data: null,
      msg: options?.message || "Internal Server Error",
    })
  );
}
