import type { ResponseErrorCode } from "@/types/errors";

export type HttpCallFunction = (url: string, options: {
  method: "GET" | "POST";
  /** Headers that should be appended to the request. */
  headers?: Record<string, string>;
  /** Body of the request of type given in the "Content-Type" header. */
  body?: unknown;
}) => Promise<unknown>;

export interface ResponseError {
  success: false;
  code: ResponseErrorCode;
  debug?: unknown;
}

export interface ResponseSuccess<T> {
  success: true;
  data: T;
}

export type Response<T> = ResponseSuccess<T> | ResponseError;
