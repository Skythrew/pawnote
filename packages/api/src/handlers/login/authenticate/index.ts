import type { PronoteApiLoginAuthenticate, ApiLoginAuthenticate } from "./types";
import { ApiLoginAuthenticateRequestSchema } from "./types";

import { PronoteApiFunctions, createPronoteAPICall } from "@/utils/requests/pronote";
import { ApiResponseErrorCode } from "@/utils/handlers/errors";
import { createApiFunction } from "@/utils/handlers/create";

import { Session } from "@/utils/session";

export default createApiFunction<ApiLoginAuthenticate>(ApiLoginAuthenticateRequestSchema, async (req, res) => {
  const session = Session.importFromObject(req.body.session);

  const request_payload = session.writePronoteFunctionPayload<PronoteApiLoginAuthenticate["request"]>({
    donnees: {
      connexion: 0,
      challenge: req.body.solved_challenge,
      espace: session.instance.account_type_id
    }
  });

  const response = await createPronoteAPICall(req.fetch)(PronoteApiFunctions.Authenticate, {
    session_instance: session.instance,
    cookies: req.body.cookies ?? [],
    payload: request_payload,
    user_agent: req.userAgent
  });

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
    code: ApiResponseErrorCode.IncorrectCredentials,
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
});
