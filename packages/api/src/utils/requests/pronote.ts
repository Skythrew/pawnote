import type { SessionInstance } from "@/utils/session";
import { PronoteApiFunctions } from "@/types/pronote_api";
import { retrieveResponseCookies } from "@/utils/requests/cookies";

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

export const callPronoteAPI = async <T>(
  function_name: PronoteApiFunctions,
  data: {
    /** Returned value of `Session.writePronoteFunctionPayload`. */
    payload: { order: string, data: T | string },
    /** Force to use this URL instead of the one in `session_instance` */
    pronote_url?: string;
    session_instance: SessionInstance;
    /** `User-Agent` header to prevent browser/bot detection issues. */
    user_agent: string;
    cookies?: string[];
  }
) => {
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
    const cookies = retrieveResponseCookies(response);

    return { payload, cookies };
  }
  catch {
    // This is most of the time caused by a network error.
    return null;
  }
};
