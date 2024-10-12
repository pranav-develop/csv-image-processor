export enum FILE_MIME_TYPE {
  CSV = "text/csv",
}

export interface ImagifyAPIResponse {
  code: number;
  image: string;
  new_size: number;
  original_size: number;
  percent: number;
  success: boolean;
}

export interface ObjectType {
  [key: string]: any;
}
