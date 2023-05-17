import type { PronoteApiLoginAuthenticate, ApiLoginAuthenticate } from "./types";
import { PronoteApiFunctions } from "@/types/pronote_api";

import { createApiFunction, callPronoteAPI, ResponseErrorCode } from "@/utils/requests";
import { Session } from "@/utils/session";

export default createApiFunction<ApiLoginAuthenticate>(async (req, res) => {
  if (!("session" in req.body) || !("solved_challenge" in req.body))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: req.body }
    }, { status: 400 });

  try {
    const session = Session.importFromObject(req.body.session);

    const request_payload = session.writePronoteFunctionPayload<PronoteApiLoginAuthenticate["request"]>({
      donnees: {
        connexion: 0,
        challenge: req.body.solved_challenge,
        espace: session.instance.account_type_id
      }
    });

    const response = await callPronoteAPI(PronoteApiFunctions.Authenticate, {
      session_instance: session.instance,
      cookies: req.body.cookies ?? [],
      payload: request_payload,
      user_agent: req.userAgent
    });

    if (response === null) return res.error({
      code: ResponseErrorCode.NetworkFail
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiLoginAuthenticate["response"]>(response.payload);
    if (typeof received === "number") return res.error({
      code: received,
      debug: {
        response,
        request_payload,
        cookies: req.body.cookies
      }
    }, { status: 400 });

    if (!received.donnees.cle) return res.error({
      code: ResponseErrorCode.IncorrectCredentials,
      debug: {
        received,
        request_payload,
        cookies: req.body.cookies
      }
    }, { status: 403 });

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
