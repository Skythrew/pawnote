import type { HttpCallFunction, ResponseError, ResponseSuccess, Response } from "@/types/internals";

export const cleanPronoteUrl = (url: string) => {
  let pronote_url = new URL(url);
  // Clean any unwanted data from URL.
  pronote_url = new URL(`${pronote_url.protocol}//${pronote_url.host}${pronote_url.pathname}`);

  // Clear the last path if we're not main selection menu.
  const paths = pronote_url.pathname.split("/");
  if (paths[paths.length - 1].includes(".html")) {
    paths.pop();
  }

  // Rebuild URL with cleaned paths.
  pronote_url.pathname = paths.join("/");

  // Return rebuilt URL without trailing slash.
  return pronote_url.href.endsWith("/") ?
    pronote_url.href.slice(0, -1) :
    pronote_url.href;
};

/** Helper to create handlers more easily with built-in support for typings. */
export const createApiFunction = <T extends {
  request: unknown;
  response: unknown;
}>(callback: (
  req: { fetch: HttpCallFunction, body: T["request"] },
  res: {
    error: (data: Omit<ResponseError, "success">, options?: { status?: number }) => { response: ResponseError, status: number },
    success: (data: T["response"]) => { response: ResponseSuccess<T["response"]>, status: 200 }
  }
) => Promise<{ response: Response<T["response"]>, status: number }>) => {
  return (fetcher: HttpCallFunction, body: T["request"]) => callback({
    fetch: fetcher,
    body
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
  })
};
