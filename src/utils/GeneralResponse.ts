import { Response } from "express";

export class GeneralResponse {
  status: number;
  msg: string;
  hasError: boolean;
  data: object | null;

  constructor({
    status = 200,
    msg = "",
    hasError = false,
    data,
  }: {
    status?: number;
    msg?: string;
    hasError?: boolean;
    data: object | null;
  }) {
    this.status = status;
    this.msg = msg;
    this.hasError = hasError;
    this.data = data;
  }
  getResponse() {
    return {
      status: this.status,
      msg: this.msg,
      hasError: this.hasError,
      data: this.data,
    };
  }
}

export const sendApiResponse = (res: Response, response: GeneralResponse) => {
  return res.status(200).json(response.getResponse());
};
