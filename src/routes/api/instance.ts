import type { PronoteApiInstance } from "@/types/pronote";
import type { ApiInstance } from "@/types/api";

import { ResponseErrorMessage } from "@/types/api";
import { PronoteApiFunctions } from "@/types/pronote";

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
      message: ResponseErrorMessage.MissingParameters,
      debug: { received_body: body }
    }, { status: 400 });

  try {
    const pronote_url = cleanPronoteUrl(body.pronote_url);

    // Download Pronote page and add `?login=true` at the end to bypass ENT.
    const pronote_page = await downloadPronotePage(pronote_url + "/?login=true");

    // Check if the Pronote page has been correctly downloaded.
    if (pronote_page === null) return res.error({
      message: ResponseErrorMessage.PronotePageDownload,
      debug: {
        pronote_url,
        pronote_page
      }
    });

    // We don't add anything at the end to be redirected to the ENT page if available.
    const ent = await checkAvailableENT(pronote_url);

    // Check if the ENT check has been successful.
    if (ent === null) return res.error({
      message: ResponseErrorMessage.ENTAvailableCheck,
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
      message: ResponseErrorMessage.SessionReadData,
      debug: {
        pronote_url,
        pronote_page
      }
    });

    const session = Session.from_raw(session_data, {
      pronote_url,
      ent_url: null,
      use_ent: false
    });

    const request_payload = session.writePronoteFunctionPayload<PronoteApiInstance["request"]>({});

    const response = await callPronoteAPI(PronoteApiFunctions.Instance, {
      payload: request_payload,
      session_instance: session.instance
    });

    if (response === null) return res.error({
      message: ResponseErrorMessage.NetworkFail
    });

    const received = session.readPronoteFunctionPayload<PronoteApiInstance["response"]>(response.payload);
    if (typeof received === "string") return res.error({
      message: received,
      debug: { response }
    }, { status: 400 });

    return res.success({
      received,
      pronote_url,
      ent_url: ent.available ? ent.url : undefined
    });
  }
  catch (error) {
    console.error("[/api/instance]", error);
    return res.error({
      message: ResponseErrorMessage.ServerSideError,
      debug: { trace: error }
    });
  }
});
