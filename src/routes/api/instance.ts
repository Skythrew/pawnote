import type { PronoteApiInstance } from "@/types/pronote";
import type { ApiInstance } from "@/types/api";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

import {
  handleServerRequest,
  cleanPronoteUrl,
  downloadPronotePage,
  checkAvailableENT,
  extractPronoteSessionFromBody,
  callPronoteAPI
} from "@/utils/server";

export const POST = handleServerRequest<ApiInstance["response"]>(async (req, res) => {
  const body = await req.json() as ApiInstance["request"];

  if (!objectHasProperty(body, "pronote_url"))
    return res.error({
      message: "Missing pronote_url.",
      debug: { received_body: body }
    }, { status: 400 });

  try {
    const pronote_url = cleanPronoteUrl(body.pronote_url);

    // Download Pronote page and add `?login=true` at the end to bypass ENT.
    const pronote_page = await downloadPronotePage(pronote_url + "/?login=true");

    // Check if the Pronote page has been correctly downloaded.
    if (pronote_page === null) return res.error({
      message: "Error while downloading the Pronote page.",
      debug: {
        pronote_url,
        pronote_page
      }
    });

    // We don't add anything at the end to be redirected to the ENT page if available.
    const ent = await checkAvailableENT(pronote_url);

    // Check if the ENT check has been successful.
    if (ent === null) return res.error({
      message: "Error while checking if ENT is available.",
      debug: {
        pronote_url
      }
    });

    // We extract session from the downloaded Pronote page.
    const session_data = extractPronoteSessionFromBody(pronote_page.body);
    if (typeof session_data === "string") return res.error({
      message: session_data,
      debug: {
        pronote_url,
        pronote_page
      }
    });

    if (session_data === null) return res.error({
      message: "Error while parsing session data.",
      debug: {
        pronote_url,
        pronote_page
      }
    });

    const session = Session.from_raw(session_data, {
      pronote_url,
      order: 0,

      use_ent: false,
      ent_cookies: [],
      ent_url: ent.available ? ent.url : null
    });

    const request_payload = session.writePronoteFunctionPayload<PronoteApiInstance["request"]>({});
    const response_payload = await callPronoteAPI("FonctionParametres", {
      pronote_url,
      payload: request_payload,
      session_data: session.data
    });

    const response = session.readPronoteFunctionPayload<PronoteApiInstance["response"]>(response_payload);
    if (typeof response === "string") return res.error({
      message: response
    }, { status: 400 });

    return res.success({
      pronote_url,
      received: response,
      ent_url: ent.available ? ent.url : undefined
    });
  }
  catch (error) {
    console.error("[/api/instance]", error);
    return res.error({
      message: "Request to Pronote failed.",
      debug: { trace: error }
    });
  }
});
