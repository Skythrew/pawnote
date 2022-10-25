import type { PronoteApiLoginAuthenticate } from "@/types/pronote";
import type { ApiLoginAuthenticate } from "@/types/api";
import { PronoteApiFunctions } from "@/types/pronote";

import {
  handleServerRequest,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiLoginAuthenticate["response"]>(async (req, res) => {
  const body = await req.json() as ApiLoginAuthenticate["request"];

  if (!objectHasProperty(body, "session") || !objectHasProperty(body, "solved_challenge"))
    return res.error({
      message: "Missing 'session' and/or 'solved_challenge'.",
      debug: { received_body: body }
    }, { status: 400 });

  try {
    const session = Session.importFromObject(body.session);

    const request_payload = session.writePronoteFunctionPayload<PronoteApiLoginAuthenticate["request"]>({
      donnees: {
        connexion: 0,
        challenge: body.solved_challenge,
        espace: session.instance.account_type_id
      }
    });

    const response_payload = await callPronoteAPI(PronoteApiFunctions.Authenticate, {
      session_instance: session.instance,
      cookies: body.cookies ?? [],
      payload: request_payload
    });

    const response = session.readPronoteFunctionPayload<PronoteApiLoginAuthenticate["response"]>(response_payload);
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
    console.error("[/api/login/authenticate]", error);
    return res.error({
      message: "Request to Pronote failed.",
      debug: { trace: error }
    });
  }
});

