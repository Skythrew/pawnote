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

    const response = await callPronoteAPI(PronoteApiFunctions.Authenticate, {
      session_instance: session.instance,
      cookies: body.cookies ?? [],
      payload: request_payload
    });

    if (response === null) return res.error({
      message: "A network error happened, please retry."
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiLoginAuthenticate["response"]>(response.payload);
    if (typeof received === "string") return res.error({
      message: received,
      debug: {
        received,
        request_payload,
        cookies: body.cookies
      }
    }, { status: 400 });

    if (!received.donnees.cle) return res.error({
      message: "Given username and/or password is incorrect.",
      debug: {
        received,
        request_payload,
        cookies: body.cookies
      }
    }, { status: 403 });

    return res.success({
      received,
      cookies: response.cookies,
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

