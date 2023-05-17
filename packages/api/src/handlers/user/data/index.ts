import type { PronoteApiUserData, ApiUserData } from "./types";
import { PronoteApiFunctions } from "@/types/pronote_api";

import { createApiFunction, callPronoteAPI, ResponseErrorCode } from "@/utils/requests";
import { Session } from "@/utils/session";

export default createApiFunction<ApiUserData>(async (req, res) => {
  try {
    // Check if we got `session` informations.
    if (!("session" in req.body))
      return res.error({
        code: ResponseErrorCode.MissingParameters,
        debug: { received_body: req.body }
      }, { status: 400 });

    const session = Session.importFromObject(req.body.session);

    const request_payload = session.writePronoteFunctionPayload<PronoteApiUserData["request"]>({});
    const response = await callPronoteAPI(PronoteApiFunctions.UserData, {
      session_instance: session.instance,
      cookies: session.instance.pronote_cookies,
      payload: request_payload,
      user_agent: req.userAgent
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
    return res.error({
      code: ResponseErrorCode.ServerSideError,
      debug: { trace: error }
    });
  }
});
