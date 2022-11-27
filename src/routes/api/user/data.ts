import type { PronoteApiUserData } from "@/types/pronote";
import type { ApiUserData } from "@/types/api";

import { PronoteApiFunctions } from "@/types/pronote";
import { ResponseErrorCode } from "@/types/errors";

import {
  handleServerRequest,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiUserData["response"]>(async (req, res) => {
  const body = await req.raw.json() as ApiUserData["request"];

  if (!objectHasProperty(body, "session"))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: body }
    }, { status: 400 });

  try {
    const session = Session.importFromObject(body.session);

    const request_payload = session.writePronoteFunctionPayload<PronoteApiUserData["request"]>({});
    const response = await callPronoteAPI(PronoteApiFunctions.UserData, {
      session_instance: session.instance,
      cookies: session.instance.pronote_cookies,
      payload: request_payload
    });

    if (response === null) return res.error({
      code: ResponseErrorCode.NetworkFail
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiUserData["response"]>(response.payload);
    if (typeof received === "number") return res.error({
      code: received,
      debug: {
        response,
        request_payload
      }
    }, { status: 400 });

    // This is the authenticated cookie that will be used to restore sessions!
    const pronote_session_cookie = response.cookies.find(cookie => cookie.startsWith("CASTGC="));
    if (pronote_session_cookie) {
      // Define the golden cookie in the session to export.
      session.instance.pronote_cookies = [pronote_session_cookie];
    }

    return res.success({
      received,
      session: session.exportToObject()
    });
  }
  catch (error) {
    console.error("[/api/user/data]", error);
    return res.error({
      code: ResponseErrorCode.ServerSideError,
      debug: { trace: error }
    });
  }
});
