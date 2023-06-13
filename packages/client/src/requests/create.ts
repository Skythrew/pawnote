import { type handlers, type ApiResponseError, ApiResponseErrorCode, type ApiResponse } from "@pawnote/api";
import { locale } from "@pawnote/i18n";

type Join<K, P> = K extends string | number ?
    P extends string | number ?
    `${K}${"" extends P ? "" : "."}${P}`
    : never : never;

type Prev = [never, 0, 1, 2, 3, 4, ...Array<0>]

type Leaves<T, D extends number = 5> = [D] extends [never] ? never : T extends Record<string | number | symbol, unknown> ?
    { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T] : "";

export interface RequestLikeApi {
  request: unknown
  response: unknown
  /** Parameters that can be passed to the API function. */
  params?: unknown
}

export type CallAPIFetcher = (request: {
  path: string
  handler_id: Leaves<typeof handlers, 5>
  body: RequestLikeApi["request"]
  params?: RequestLikeApi["params"]
}) => Promise<ApiResponse<RequestLikeApi["response"]>>

export interface CallApiRequester<T extends RequestLikeApi> {
  handler_id: Leaves<typeof handlers, 5>
  body: T["request"]
  params?: T["params"]
}

export class ApiError extends Error {
  public debug?: ApiResponseError["debug"];
  public code: ApiResponseErrorCode;
  public message: string;

  constructor (response: ApiResponseError) {
    const [t] = locale;

    const error_message: string = t(`API_ERRORS.${response.code}`);

    const message = `ResponseErrorCode[#${response.code}]: ${error_message}`;
    super(message);

    this.name = "ApiError";
    this.debug = response.debug;
    this.code = response.code;
    this.message = message;
  }
}

/**
 * Adds `path` parameter to final fetcher.
 * TODO: Intercept requests to store them locally in the cache.
 */
export const callAPI = async <T extends RequestLikeApi>(
  fetcher: CallAPIFetcher,
  request: CallApiRequester<T>
): Promise<T["response"]> => {
  let path: string;

  switch (request.handler_id) {
    case "geolocation":
      path = "/geolocation";
      break;
    case "instance":
      path = "/instance";
      break;
    default:
      throw new Error(`[@pawnote/client][requests/create]: case "${request.handler_id}" doesn't exist !`);
  }

  const response = await fetcher({
    path,
    handler_id: request.handler_id,
    body: request.body,
    params: request.params
  });

  if (!response.success) {
    throw new ApiError(response);
  }

  return response.data;
};
