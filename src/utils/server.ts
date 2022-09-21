// These utility functions are made for server-side usage only.
import type { ResponseError, ResponseSuccess } from "@/types/api";
import type { FetchEvent } from "solid-start/server";
import { json } from "solid-start/server";

export const handleServerRequest = <T>(callback: (
  req: FetchEvent["request"],
  res: {
    error: (params: Omit<ResponseError, "success">, options?: ResponseInit) => ReturnType<typeof json>,
    success: (data: T, options?: ResponseInit) => ReturnType<typeof json>
  }
) => Promise<unknown>) => {
  return (evt: FetchEvent) => callback(
    evt.request, ({
      error: (
        params,
        options
      ) => json(createResponseError(params), options),
      success: (
        data,
        options
      ) => json(createResponseSuccess(data), options)
    })
  );
};

const createResponseError = (options: Omit<ResponseError, "success">): ResponseError => ({
  success: false,
  message: options.message,
  debug: options.debug
});

const createResponseSuccess = <T>(data: T): ResponseSuccess<T> => ({
  success: true,
  data
});

