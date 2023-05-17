import type { HttpCallFunction, ResponseError, ResponseSuccess, Response } from "./types";

/** Helper to create handlers more easily with built-in support for typings. */
const createApiFunction = <T extends {
  request: unknown;
  response: unknown;
}>(callback: (
  req: { fetch: HttpCallFunction, body: T["request"], userAgent: string },
  res: {
    error: (data: Omit<ResponseError, "success">, options?: { status?: number }) => { response: ResponseError, status: number },
    success: (data: T["response"]) => { response: ResponseSuccess<T["response"]>, status: 200 }
  }
) => Promise<{ response: Response<T["response"]>, status: number }>) => {
  return (fetcher: HttpCallFunction, body: T["request"], userAgent: string) => callback({
    fetch: fetcher,
    body,
    userAgent
  }, {
    success: (data) => ({
      status: 200,
      response: {
        success: true,
        data
      }
    }),
    error: (data, options) => ({
      status: options?.status ?? 500,
      response: {
        success: false,
        code: data.code,
        debug: data.debug
      }
    })
  });
};

export default createApiFunction;
