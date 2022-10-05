// These utility functions are made for server-side usage only.

import { PronoteApiAccountId } from "@/types/pronote";
import type { ResponseError } from "@/types/api";
import type { FetchEvent } from "solid-start/server";

import { aes_decrypt, aes_encrypt } from "@/utils/encryption";
import { json } from "solid-start/server";
import { HEADERS_PRONOTE, PRONOTE_ACCOUNT_TYPES } from "./constants";

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
        options
      ) => json({
        success: false,
        message: params.message,
        debug: params.debug
      }, options),
      success: (
        data,
        options
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
 * Allows you to request calls directly so you don't
 * have to manage orders/encryption/compression.
 */
export const createPronoteApiCall = async (options: {
  pronote_url: string;
  account_type_id: PronoteApiAccountId;

  cookies: Record<string, string>;
}) => {
  const pronote_url = cleanPronoteUrl(options.pronote_url);
  const account_type = PRONOTE_ACCOUNT_TYPES[options.account_type_id];

  console.info("// todo", pronote_url, account_type);
};

/**
 * @param url - URL to download the data from.
 * @param cookie - Cookies to send with the request (separated by `;`).
 * - When a login cookie is provided, the request will provide another
 * cookie that will be used on next login.
 */
export const downloadPronotePage = async (url: string, cookie: string): Promise<{
  /** Data **as text** from the given URL. */
  body: string;

  /**
   * Cookie given by Pronote for authentification step
   * when a session is being restored OR when using ENT.
   */
  login_cookie?: string;
} | null> => {
  try {
    const response = await fetch(url, {
      redirect: "manual", // Bypass ENT redirection.
      headers: {
        ...HEADERS_PRONOTE,

        // Append cookies to the request.
        "Cookie": cookie
      }
    });

    // Check if Pronote responded with new cookies if provided.
    const new_cookies = response.headers.get("set-cookie");

    return {
      login_cookie: new_cookies ? new_cookies[0] : undefined,
      body: await response.text()
    };
  }
  catch (error) {
    console.error("Error when trying to download", url, "with", cookie ?? "no cookies", "\nTrace:", error ?? "(none)");
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
