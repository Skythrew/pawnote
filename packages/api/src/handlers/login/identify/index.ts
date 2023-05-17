import type { PronoteApiLoginIdentify, ApiLoginIdentify } from "./types";
import { PronoteApiFunctions } from "@/types/pronote_api";

import { createApiFunction, callPronoteAPI, ResponseErrorCode } from "@/utils/requests";
import { Session } from "@/utils/session";

export default createApiFunction<ApiLoginIdentify>(async (req, res) => {
  if (!("session" in req.body) || !("pronote_username" in req.body))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: req.body }
    }, { status: 400 });

  try {
    const session = Session.importFromObject(req.body.session);

    const request_payload = session.writePronoteFunctionPayload<PronoteApiLoginIdentify["request"]>({
      donnees: {
        genreConnexion: 0,
        genreEspace: session.instance.account_type_id,
        identifiant: req.body.pronote_username,
        pourENT: session.instance.use_ent ?? false,
        enConnexionAuto: false,
        demandeConnexionAuto: false,
        demandeConnexionAppliMobile: false,
        demandeConnexionAppliMobileJeton: false,
        uuidAppliMobile: "",
        loginTokenSAV: ""
      }
    });

    const response = await callPronoteAPI(PronoteApiFunctions.Identify, {
      session_instance: session.instance,
      cookies: req.body.cookies ?? [],
      payload: request_payload,
      user_agent: req.userAgent
    });

    if (response === null) return res.error({
      code: ResponseErrorCode.NetworkFail
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiLoginIdentify["response"]>(response.payload);
    if (typeof received === "number") return res.error({
      code: received,
      debug: {
        response,
        request_payload,
        cookies: req.body.cookies
      }
    }, { status: 400 });

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
