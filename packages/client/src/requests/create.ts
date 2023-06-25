import { type handlers, type ApiResponse } from "@pawnote/api";
import { ApiError } from "@/utils/errors";

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
    case "instance":
    case "login.informations":
    case "login.ent_cookies":
    case "login.ent_ticket":
    case "login.authenticate":
    case "login.identify":
    case "user.data":
      path = `/${request.handler_id.replaceAll(".", "/")}`;
      break;

    case "user.grades":
      if (typeof request.params !== "object" || request.params === null ||
        !("period_id" in request.params) || typeof request.params.period_id !== "string"
      ) {
        throw new Error("[@pawnote/client][requests/create(user.grades)]: `period_id` check not passed.");
      }

      path = "/user/grades/" + request.params.period_id;
      break;

    case "user.homework.done":
      if (typeof request.params !== "object" || request.params === null ||
        !("id" in request.params) || typeof request.params.id !== "string"
      ) {
        throw new Error("[@pawnote/client][requests/create(user.homework.done)]: `id` check not passed.");
      }

      path = "/user/homework/" + request.params.id + "/done";
      break;

    case "user.homeworks":
    case "user.resources":
    case "user.timetable":
      if (typeof request.params !== "object" || request.params === null ||
        !("week" in request.params) || typeof request.params.week !== "number"
      ) {
        throw new Error(`[@pawnote/client][requests/create(${request.handler_id})]: \`week\` check not passed.`);
      }

      path = `/${request.handler_id.replaceAll(".", "/")}/${request.params.week}`;
      break;

    default:
      throw new Error("[@pawnote/client][requests/create]: case doesn't exist !");
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
