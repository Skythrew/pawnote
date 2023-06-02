import type { handlers } from "@pawnote/api";

type Join<K, P> = K extends string | number ?
    P extends string | number ?
    `${K}${"" extends P ? "" : "."}${P}`
    : never : never;

type Prev = [never, 0, 1, 2, 3, 4, ...Array<0>]

type Leaves<T, D extends number = 5> = [D] extends [never] ? never : T extends Record<string | number | symbol, unknown> ?
    { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T] : "";

interface RequestLikeApi {
  request: unknown
  response: unknown
  /** Parameters that can be passed to the API function. */
  params?: unknown
}

export type CallAPIFetcher<T extends RequestLikeApi> = (path: string, body: T["request"]) => Promise<T["response"]>

export const callAPI = async <T extends RequestLikeApi>(
  fetcher: CallAPIFetcher<T>,
  request: {
    handler_id: Leaves<typeof handlers, 5>
    body: T["request"]
  }
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
      throw new Error("something unexpected happened !");
  }

  return await fetcher(path, request.body);
};
