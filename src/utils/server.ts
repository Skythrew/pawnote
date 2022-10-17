// These utility functions are made for server-side usage only.

import type { FetchEvent } from "solid-start/server";
import type { PronoteApiFunctions, PronoteApiSession } from "@/types/pronote";
import type { ResponseError } from "@/types/api";
import type { SessionData } from "@/types/session";

import { HEADERS_PRONOTE } from "@/utils/constants";

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
        options = { status: 500 }
      ) => json({
        success: false,
        message: params.message,
        debug: params.debug
      }, options),
      success: (
        data,
        options = { status: 200 }
      ) => json({ success: true, data }, options)
    })
  );
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

/**
 * @param url - URL to download the data from.
 * @param cookies - Cookies to send with the request.
 */
export const downloadPronotePage = async (url: string, cookies?: string[]): Promise<{
  /** Data **as text** from the given URL. */
  body: string;

  /**
   * Cookie given by Pronote for authentification step
   * when a session is being restored OR when using ENT.
   */
  login_cookie?: string;
} | null> => {
  try {
    console.log("from:", cookies?.join("; ") ?? "");
    const response = await fetch(url, {
      redirect: "manual", // Bypass redirections.
      headers: {
        ...HEADERS_PRONOTE,

        // Append cookies to the request.
        "Cookie": cookies?.join("; ") ?? ""
      }
    });

    // Check if Pronote sent a cookie.
    const new_cookie = response.headers.get("set-cookie");

    return {
      // We split to get only the cookie key/value.
      login_cookie: new_cookie?.split(";")[0],
      body: await response.text()
    };
  }
  catch (error) {
    console.error("Error when trying to download", url, "with", cookies ?? "no cookies", "\nTrace:", error ?? "(none)");
    return null;
  }
};

/**
 * Check if an ENT is available on a given Pronote URL.
 * @param url - Pronote URL to check.
 */
export const checkAvailableENT = async (url: string): Promise<(
  | { available: false }
  | { available: true, url: string }
) | null> => {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        ...HEADERS_PRONOTE
      }
    });

    // Get the hostname of the Pronote URL.
    const pronoteUrlHostname = new URL(url).hostname;

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
  | string // Error message.
  | null // Nothing returned.
) => {
  if (body.includes("Votre adresse IP est provisoirement suspendue")) {
    return "Your IP address has been temporary banned.";
  }

  if (body.includes("Le site n'est pas disponible")) {
    return "This Pronote instance is closed.";
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
    pronote_url: string;
    session_data: SessionData;
    cookies?: string[];
  }) => {
  try {
    const function_url = data.pronote_url + `/appelfonction/${data.session_data.account_type_id}/${data.session_data.session_id}/${data.payload.order}`;
    const response = await fetch(function_url, {
      method: "POST",
      headers: {
        ...HEADERS_PRONOTE,
        "Content-Type": "application/json",
        "Cookie": data.cookies?.join("; ") ?? ""
      },
      body: JSON.stringify({
        session: data.session_data.session_id,
        numeroOrdre: data.payload.order,
        nom: function_name,

        donneesSec: data.payload.data
      })
    });

    const body = await response.text();
    return body;
  }
  catch (error) {
    return null;
  }
};
