import { callAPI, type RequestLikeApi, type CallApiRequester, CallAPIFetcher } from "@pawnote/client";
import { ApiResponse, handlers, type HttpCallFunction } from "@pawnote/api";

import { CapacitorHttp } from "@capacitor/core";

// We prevent Pronote to recognize that the device is a mobile device.
const user_agent = navigator.userAgent.replace(/(iPhone|iPhone;|Mobile;|Mobile\/?(.*)) |Mobile/gi, "");

export const fetcher: HttpCallFunction = async (url, options) => {
  const headers = options.headers instanceof Headers
    ? Object.fromEntries(options.headers.entries())
    : options.headers ?? {};

  headers["User-Agent"] = user_agent;

  let data = options.body;

  if (data instanceof URLSearchParams) {
    data = data.toString();
  }

  const response = await CapacitorHttp.request({
    url,
    method: options.method,
    data,
    headers,
    disableRedirects: options.redirect === "manual"
  });

  return ({
    headers: response.headers as Record<string, string>,
    json: async <T>() => JSON.parse(await response.data) as T,
    text: () => response.data
  });
};

export const switchAPIHandler: CallAPIFetcher = async (request) => {
  type Handler = (fetcher: HttpCallFunction, body: unknown, params: unknown) => Promise<{ response: ApiResponse<unknown>, status: number }>;
  let handler: Handler;

  switch (request.handler_id) {
    case "geolocation":
      handler = handlers.geolocation as Handler;
      break;
    case "instance":
      handler = handlers.instance as Handler;
      break;
    default:
      throw new Error("handler not found");
  }

  const data = await handler(fetcher, request.body, request.params);
  return data.response.data as unknown;
};

export const callAPIUsingCapacitor = async <T extends RequestLikeApi>(request: CallApiRequester<T>): ReturnType<Awaited<typeof callAPI<T>>> => {
  return await callAPI(switchAPIHandler, request);
};
