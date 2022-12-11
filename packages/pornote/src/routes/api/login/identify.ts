import type { PronoteApiLoginIdentify } from "@/types/pronote";
import type { ApiLoginIdentify } from "@/types/api";

import { PronoteApiFunctions } from "@/types/pronote";
import { ResponseErrorCode } from "@/types/errors";

import {
  handleServerRequest,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiLoginIdentify>(async (req, res) => {
  if (!objectHasProperty(req.body, "session") || !objectHasProperty(req.body, "pronote_username"))
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
      user_agent: req.user_agent
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
    console.error("[/api/login/identify]", error);
    return res.error({
      code: ResponseErrorCode.ServerSideError,
      debug: { trace: error }
    });
  }
});

