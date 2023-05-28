import type { PronoteApiUserData, ApiUserData } from "./types";
import { ApiUserDataRequestSchema } from "./types";

import { PronoteApiFunctions } from "@/utils/requests/pronote";

import { createApiFunction } from "@/utils/handlers/create";
import { createPronoteAPICall } from "@/utils/requests/pronote";
import { Session } from "@/utils/session";

export default createApiFunction<ApiUserData>(ApiUserDataRequestSchema, async (req, res) => {
  const session = Session.importFromObject(req.body.session);

  const request_payload = session.writePronoteFunctionPayload<PronoteApiUserData["request"]>({});
  const response = await createPronoteAPICall(req.fetch)(PronoteApiFunctions.UserData, {
    session_instance: session.instance,
    cookies: session.instance.pronote_cookies,
    payload: request_payload,
    user_agent: req.userAgent
  });

  const received = session.readPronoteFunctionPayload<PronoteApiUserData["response"]>(response.payload);

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
});
