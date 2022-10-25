import type { PronoteApiLoginIdentify } from "@/types/pronote";
import type { ApiLoginIdentify } from "@/types/api";
import { PronoteApiFunctions } from "@/types/pronote";

import {
  handleServerRequest,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiLoginIdentify["response"]>(async (req, res) => {
  const body = await req.json() as ApiLoginIdentify["request"];

  if (!objectHasProperty(body, "session") || !objectHasProperty(body, "pronote_username"))
    return res.error({
      message: "Missing 'session' and/or 'pronote_username'.",
      debug: { received_body: body }
    }, { status: 400 });

  try {
    const session = Session.importFromObject(body.session);

    const request_payload = session.writePronoteFunctionPayload<PronoteApiLoginIdentify["request"]>({
      donnees: {
        genreConnexion: 0,
        genreEspace: session.instance.account_type_id,
        identifiant: body.pronote_username,
        pourENT: session.instance.use_ent ?? false,
        enConnexionAuto: false,
        demandeConnexionAuto: false,
        demandeConnexionAppliMobile: false,
        demandeConnexionAppliMobileJeton: false,
        uuidAppliMobile: "",
        loginTokenSAV: ""
      }
    });

    const response_payload = await callPronoteAPI(PronoteApiFunctions.Identify, {
      session_instance: session.instance,
      cookies: body.cookies ?? [],
      payload: request_payload
    });

    const response = session.readPronoteFunctionPayload<PronoteApiLoginIdentify["response"]>(response_payload);
    if (typeof response === "string") return res.error({
      message: response,
      debug: {
        request_payload,
        response_payload,
        cookies: body.cookies
      }
    }, { status: 400 });

    return res.success({
      received: response,
      session: session.exportToObject()
    });
  }
  catch (error) {
    console.error("[/api/login/identify]", error);
    return res.error({
      message: "Request to Pronote failed.",
      debug: { trace: error }
    });
  }
});

