import { HandlerResponseError, ApiResponseErrorCode } from "@/utils/handlers/errors";

import { z } from "zod";
import { serializeError } from "serialize-error";

export interface ApiResponseError {
  success: false;
  code: ApiResponseErrorCode;
  debug?: unknown;
}

export interface ApiResponseSuccess<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

/**
 * A simple `fetcher` function with built-in
 * typings used to fetch external resources.
 */
export type HttpCallFunction = (url: string, options: {
  method: "GET" | "POST";
  /** Headers that should be appended to the request. */
  headers?: Record<string, string> | Headers;
  /** Body of the request of type given in the "Content-Type" header. */
  body?: unknown;
  /** Whether we should automatically handle the redirections or do it by hand. */
  redirect?: "follow" | "manual";
}) => Promise<{
  headers: Record<string, string> | Headers;
  text: () => Promise<string>;
  json: <T>() => Promise<T>;
}>;

type RequestLikeApi = {
  request: unknown;
  response: unknown;
  /** Parameters that can be passed to the API function. */
  params?: unknown;
}

type HandlerFunction<T extends RequestLikeApi> = (
  req: {
    fetch: HttpCallFunction,
    body: T["request"],
    params: T["params"],
    userAgent: string
  },
  res: {
    error: (
      data: Omit<ApiResponseError, "success">,
      options?: { status?: number }
    ) => {
      response: ApiResponseError,
      status: number
    },
    success: (data: T["response"]) => {
      response: ApiResponseSuccess<T["response"]>,
      status: 200
    }
  }
) => Promise<{ response: ApiResponse<T["response"]>, status: number}>

/** Internal helper to create handlers easily with built-in support for typings. */
export const createApiFunction = <T extends RequestLikeApi>(requestBodySchema: z.ZodType, callback: HandlerFunction<T>) => async (
  fetcher: HttpCallFunction,
  body: T["request"],
  params: T["params"],
  userAgent: string
): ReturnType<HandlerFunction<T>> => {
  // Validate the request body before continue.
  const requestBodyCheck = requestBodySchema.safeParse(body);
  if (!requestBodyCheck.success) return ({
    status: 400,
    response: {
      success: false,
      code: ApiResponseErrorCode.InvalidRequestBody
    }
  });

  try {
    return callback({
      fetch: fetcher,
      body,
      params,
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
          ...data
        }
      })
    });
  }
  catch (error) {
    if (error instanceof HandlerResponseError) {
      return {
        status: error.status,
        response: {
          success: false,
          code: error.code,
          debug: error.debug
        }
      };
    }

    return {
      status: 500,
      response: {
        success: false,
        code: ApiResponseErrorCode.UnknownServerSideError,
        debug: { error: serializeError(error) }
      }
    };
  }
};
