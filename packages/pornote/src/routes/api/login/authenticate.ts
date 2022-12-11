import type { PronoteApiLoginAuthenticate } from "@/types/pronote";
import type { ApiLoginAuthenticate } from "@/types/api";

import { PronoteApiFunctions } from "@/types/pronote";
import { ResponseErrorCode } from "@/types/errors";

import {
  handleServerRequest,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiLoginAuthenticate>(async (req, res) => {
  if (!objectHasProperty(req.body, "session") || !objectHasProperty(req.body, "solved_challenge"))
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
      user_agent: req.user_agent
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
    console.error("[/api/login/authenticate]", error);
    return res.error({
      code: ResponseErrorCode.ServerSideError,
      debug: { trace: error }
    });
  }
});

