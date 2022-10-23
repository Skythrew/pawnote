import type { PronoteApiLoginIdentify } from "@/types/pronote";
import type { ApiLoginIdentify } from "@/types/api";

import {
  handleServerRequest,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiLoginIdentify["response"]>(async (req, res) => {
  const body = await req.json() as ApiLoginIdentify["request"];

  if (!objectHasProperty(body, "session"))
    return res.error({
      message: "Missing 'session'.",
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
    const response_payload = await callPronoteAPI("Identification", {
      cookies: body.cookies ?? [],
      payload: request_payload,
      session_instance: session.instance
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
      received: response
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

