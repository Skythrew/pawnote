import type { HttpCallFunction, ApiResponseError, ApiResponse } from "@pawnote/api";
import { ApiResponseErrorCode } from "@pawnote/api";

import rate_limiter, { type RateLimiter } from "lambda-rate-limiter";
import { type APIEvent, json } from "solid-start/api";

import { searchParamsToObject } from "@/utils/globals";

declare global {
  // eslint-disable-next-line no-var
  var _rate_limiter: RateLimiter;
}

export const createFetcher = (user_agent: string): HttpCallFunction => async (url, options) => {
  const response = await fetch(url, {
    method: options.method,
    body: options.body as BodyInit | undefined,
    headers: {
      "User-Agent": user_agent,
      ...options.headers
    }
  });

  return ({
    headers: response.headers,
    json: <T>() => response.json() as T,
    text: async () => await response.text()
  });
};

export const handleServerRequest = <T extends {
  request: unknown
  response: unknown
}>(callback: (
  req: {
    body: T["request"]
    user_agent: string
    params: APIEvent["params"]
    fetcher: HttpCallFunction
  },
  res: {
    error: (params: Omit<ApiResponseError, "success">, options?: ResponseInit) => ReturnType<typeof json>
    success: (data: T["response"], options?: ResponseInit) => ReturnType<typeof json>
    from: (data: { response: ApiResponse<T["response"]>, status: number }) => ReturnType<typeof json>
  }
) => Promise<unknown>) => {
  return async (evt: APIEvent) => {
    const ip = evt.request.headers.get("x-real-ip") ?? evt.request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const limit_count = 30;

    if (global._rate_limiter === undefined) {
      (
        global._rate_limiter = rate_limiter({
          interval: 1000 * 2, // 2 seconds.
          uniqueTokenPerInterval: 500
        })
      );
    }

    try {
      await global._rate_limiter.check(limit_count, ip);
    }
    catch (count) {
      return json({
        success: false,
        code: ApiResponseErrorCode.RateLimit,
        debug: {
          current_count: count,
          limit_count
        }
      }, { status: 429 });
    }

    let body: T["request"] | undefined;

    try {
      body = evt.request.method.toUpperCase() === "GET"
        ? searchParamsToObject(new URL(evt.request.url).searchParams.entries())
        : await evt.request.json();
    }
    catch {
      return json({
        success: false,
        code: ApiResponseErrorCode.InvalidRequestBody
      });
    }

    if (typeof body === "undefined") {
      (
        body = {} satisfies T["request"]
      );
    }

    let user_agent = evt.request.headers.get("user-agent");
    if (user_agent === null || user_agent.length === 0) {
      return json({
        success: false,
        code: ApiResponseErrorCode.InvalidRequestBody,
        debug: { user_agent }
      });
    }

    // We prevent Pronote to recognize that the device is a mobile device.
    user_agent = user_agent.replace(/(iPhone|iPhone;|Mobile;|Mobile\/?(.*)) |Mobile/gi, "");

    return await callback(
      {
        body,
        user_agent,
        params: evt.params,
        fetcher: createFetcher(user_agent)
      }, ({
        error: (
          params,
          options = { status: 500 }
        ) => json({
          success: false,
          code: params.code,
          debug: params.debug
        }, options),
        success: (
          data,
          options = { status: 200 }
        ) => json({ success: true, data }, options),
        from: (data) => json(data.response, { status: data.status })
      })
    );
  };
};
