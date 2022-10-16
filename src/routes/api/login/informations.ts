import type { ApiLoginInformations } from "@/types/api";

import {
  extractPronoteSessionFromBody,
  downloadPronotePage,
  handleServerRequest,
  cleanPronoteUrl
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiLoginInformations["response"]>(async (req, res) => {
  const body = await req.json() as ApiLoginInformations["request"];

  if (!objectHasProperty(body, "pronote_url") || !objectHasProperty(body, "account_type"))
    return res.error({
      message: "Missing 'pronote_url' and/or 'account_type'.",
      debug: { received_body: body }
    }, { status: 400 });

  try {
    // Don't clean the URL when `raw_url` is set to `true`.
    const pronote_url_string = body.raw_url && body.raw_url === true
      ? body.pronote_url
      : cleanPronoteUrl(body.pronote_url);

    // We append `login=true` at the end to bypass any ENT.
    const pronote_url = new URL(pronote_url_string);
    pronote_url.searchParams.set("login", "true");

    const pronote_page = await downloadPronotePage(pronote_url.href);

    // Check if the Pronote page has been correctly downloaded.
    if (pronote_page === null) return res.error({
      message: "Error while downloading the Pronote page.",
      debug: {
        pronote_url: pronote_url.href,
        pronote_page
      }
    });

    // We extract session from the downloaded Pronote page.
    const session_data = extractPronoteSessionFromBody(pronote_page.body);
    if (typeof session_data === "string") return res.error({
      message: session_data,
      debug: {
        pronote_url: pronote_url.href,
        pronote_page
      }
    });

    if (session_data === null) return res.error({
      message: "Error while parsing session data.",
      debug: {
        pronote_url: pronote_url.href,
        pronote_page
      }
    });

    const session = Session.from_raw(session_data, {
      pronote_url: pronote_url.href,
      order: 0,

      ent: undefined
    });

    return res.success({
      session: session.exportToObject(),
      pronote_url: pronote_url.href,
      received: null
    });
  }
  catch (error) {
    console.error("[/api/login/informations]", error);
    return res.error({
      message: "Request to Pronote failed.",
      debug: { trace: error }
    });
  }
});

