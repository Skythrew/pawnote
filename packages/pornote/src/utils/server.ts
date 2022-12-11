/// These utility functions are made for server-side usage only.

import type { PronoteApiFunctions, PronoteApiSession } from "@/types/pronote";
import type { SessionInstance } from "@/types/session";
import type { ResponseError } from "@/types/api";

import rate_limiter, { type RateLimiter } from "lambda-rate-limiter";
import { type APIEvent, json } from "solid-start/api";
import set_cookie from "set-cookie-parser";

import { ResponseErrorCode } from "@/types/errors";

declare global {
  // eslint-disable-next-line no-var
  var _rate_limiter: RateLimiter;
}

const searchParamsToObject = (entries: IterableIterator<[string, string]>) => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of entries) {
    result[key] = value;
  }

  return result;
};

export const handleServerRequest = <T extends {
  request: unknown;
  response: unknown;
}>(callback: (
  req: { body: T["request"], user_agent: string, params: APIEvent["params"] },
  res: {
    error: (params: Omit<ResponseError, "success">, options?: ResponseInit) => ReturnType<typeof json>,
    success: (data: T["response"], options?: ResponseInit) => ReturnType<typeof json>
  }
) => Promise<unknown>) => {
  return async (evt: APIEvent) => {
    const ip = evt.request.headers.get("x-real-ip") || evt.request.headers.get("x-forwarded-for") || "127.0.0.1";
    const limit_count = 30;

    if (!global._rate_limiter) (
      global._rate_limiter = rate_limiter({
        interval: 1000 * 2, // 2 seconds.
        uniqueTokenPerInterval: 500
      })
    );

    try {
      await global._rate_limiter.check(limit_count, ip);
    }
    catch (count) {
      return json({
        success: false,
        code: ResponseErrorCode.RateLimit,
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
        code: ResponseErrorCode.IncorrectParameters
      });
    }

    if (typeof body === "undefined") (
      body = {} as T["request"]
    );

    const user_agent = evt.request.headers.get("user-agent");
    if (!user_agent) return json({
      success: false,
      code: ResponseErrorCode.IncorrectParameters,
      debug: { user_agent }
    });

    return callback(
      {
        body,
        // We prevent Pronote to recognize that the device is a mobile device.
        user_agent: user_agent.replace(/(iPhone|iPhone;|Mobile;|Mobile\/?(.*)) |Mobile/gi, ""),
        params: evt.params
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
        ) => json({ success: true, data }, options)
      })
    );
  };
};

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

export const retrieveSentCookies = (response: Response) => {
  const response_cookies = response.headers.get("set-cookie");
  const sent_cookies: string[] = [];

  if (response_cookies) {
    const splitted = set_cookie.splitCookiesString(response_cookies);
    const cleaned = splitted.map(cookie => cookie.split(";")[0]);

    for (const cookie of cleaned) {
      sent_cookies.push(cookie);
    }
  }

  return sent_cookies;
};

export const downloadPronotePage = async (options: {
  url: string,
  cookies?: string[],
  user_agent: string
}): Promise<{
  /** Data **as text** from the given URL. */
  body: string;

  /**
   * Cookies can be given by Pronote for authentification step
   * when a session is being restored OR when using ENT.
   */
  cookies: string[];
} | null> => {
  try {
    const response = await fetch(options.url, {
      redirect: "manual", // Bypass redirections.
      headers: {
        "User-Agent": options.user_agent,

        // Append cookies to the request.
        "Cookie": options.cookies?.join("; ") ?? ""
      }
    });

    return {
      cookies: retrieveSentCookies(response),
      body: await response.text()
    };
  }
  catch (error) {
    console.error("Error when trying to download", options.url, "with", options.cookies ?? "no cookies", "\nTrace:", error ?? "(none)");
    return null;
  }
};

/** Check if an ENT is available on a given Pronote URL. */
export const checkAvailableENT = async (options: {
  url: string,
  user_agent: string
}): Promise<(
  | { available: false }
  | { available: true, url: string }
) | null> => {
  try {
    const response = await fetch(options.url, {
      redirect: "follow",
      headers: {
        "User-Agent": options.user_agent
      }
    });

    // Get the hostname of the Pronote URL.
    const pronoteUrlHostname = new URL(options.url).hostname;

    // Get the hostname of the redirected URL.
    const newUrlHostname = new URL(response.url).hostname;

    // Check if Pronote URL hostname is same as redirected URL hostname.
    // If they aren't the same, an ENT is available.
    if (pronoteUrlHostname !== newUrlHostname) {
      return {
        available: true,
        url: response.url
      };
    }

    return { available: false };
  }
  catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Takes a Pronote page as parameter then parses it.
 * Checks if an error message is written on the page, if yes then it returns a **string**.
 * If no error, then it returns the session as a parsed **object**.
 * **null** can be returned if there was an error in the parsing process.
 */
export const extractPronoteSessionFromBody = (body: string): (
  | PronoteApiSession // Actual session.
  | ResponseErrorCode // Error message.
  | null // Nothing returned.
) => {
  if (body.includes("Votre adresse IP est provisoirement suspendue")) {
    return ResponseErrorCode.PronoteBannedIP;
  }

  if (body.includes("Le site n'est pas disponible")) {
    return ResponseErrorCode.PronoteClosedInstance;
  }

  try {
    // Remove all spaces and line breaks.
    const body_cleaned = body.replace(/ /ug, "").replace(/\n/ug, "");

    // Find the relaxed JSON of the session.
    const from = "Start(";
    const to = ")}catch";

    const relaxed_data = body_cleaned.substring(
      body_cleaned.indexOf(from) + from.length,
      body_cleaned.indexOf(to)
    );

    // Convert the relaxed JSON to something we can parse.
    const session_data_string = relaxed_data
      .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/gu, "\"$2\": ")
      .replace(/'/gu, "\"");

    const session_data_raw = JSON.parse(session_data_string) as PronoteApiSession;
    return session_data_raw;
  }
  catch (error) {
    console.error("Error when trying to parse Pronote session.\nTrace:", error ?? "(no error)");
    return null;
  }
};

export const callPronoteAPI = async <T>(
  function_name: PronoteApiFunctions,
  data: {
    /** Returned value of `Session.writePronoteFunctionPayload`. */
    payload: { order: string, data: T | string },
    /** Force to use this URL instead of the one in `session_instance` */
    pronote_url?: string;
    session_instance: SessionInstance;
    user_agent: string;
    cookies?: string[];
  }) => {
  try {
    const pronote_url = typeof data.pronote_url === "string" ? data.pronote_url : data.session_instance.pronote_url;
    const function_url = pronote_url + `/appelfonction/${data.session_instance.account_type_id}/${data.session_instance.session_id}/${data.payload.order}`;
    const response = await fetch(function_url, {
      method: "POST",
      headers: {
        "User-Agent": data.user_agent,
        "Content-Type": "application/json",
        "Cookie": data.cookies?.join("; ") ?? ""
      },
      body: JSON.stringify({
        session: data.session_instance.session_id,
        numeroOrdre: data.payload.order,
        nom: function_name,

        donneesSec: data.payload.data
      })
    });

    const payload = await response.text();
    const cookies = retrieveSentCookies(response);

    return { payload, cookies };
  }
  catch {
    // This is most of the time caused by a network error.
    return null;
  }
};