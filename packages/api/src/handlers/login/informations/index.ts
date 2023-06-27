import type { PronoteApiLoginInformations, ApiLoginInformations } from "./types";
import { ApiLoginInformationsRequestSchema } from "./types";

import { createApiFunction } from "@/utils/handlers/create";
import { ApiResponseErrorCode, HandlerResponseError } from "@/utils/handlers/errors";

import { PronoteApiFunctions, cleanPronoteUrl, downloadPronotePage, extractPronoteSessionFromBody, createPronoteAPICall } from "@/utils/requests/pronote";
import { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";

import { Session } from "@/utils/session";
import forge from "node-forge";

export default createApiFunction<ApiLoginInformations>(ApiLoginInformationsRequestSchema, async (req, res) => {
  const account_type = PRONOTE_ACCOUNT_TYPES.find(entry => entry.id === req.body.account_type);

  if (typeof account_type === "undefined") {
    throw new HandlerResponseError(
      ApiResponseErrorCode.InvalidRequestBody, { status: 400 }
    );
  };

  const pronote_page = await downloadPronotePage(req.fetch, {
    url: req.body.pronote_url,
    // Those cookies are very important since they're like the *initializer*.
    // When logging in for the first time using ENT, you'll have three important cookies here.
    // If they're not present, the whole authentication process will fail.
    cookies: req.body.cookies
  });

  // We extract session data from the downloaded instance page.
  const session_data = extractPronoteSessionFromBody(pronote_page.body);

  const session = Session.from_raw(session_data, {
    pronote_url: cleanPronoteUrl(req.body.pronote_url)
  });

  // Create RSA using given modulos.
  const rsa_key = forge.pki.rsa.setPublicKey(
    new forge.jsbn.BigInteger(session.encryption.rsa.modulus, 16),
    new forge.jsbn.BigInteger(session.encryption.rsa.exponent, 16)
  );

  const aes_iv = session.encryption.aes.iv;
  if (aes_iv === undefined) {
    return res.error({
      code: ApiResponseErrorCode.NoIVForAESCreated,
      debug: {
        pronote_page,
        pronote_page_url: req.body.pronote_url,
        encryption: session.encryption
      }
    }, { status: 500 });
  }

  // Create "Uuid" property for the request.
  const rsa_uuid = forge.util.encode64(rsa_key.encrypt(aes_iv), 64);

  const cookies = req.body.cookies ?? [];
  for (const cookie of pronote_page.cookies) {
    cookies.push(cookie);
  }

  const request_payload = session.writePronoteFunctionPayload<PronoteApiLoginInformations["request"]>({
    donnees: {
      identifiantNav: null,
      Uuid: rsa_uuid
    }
  });

  const response = await createPronoteAPICall(req.fetch)(PronoteApiFunctions.Informations, {
    cookies,
    payload: request_payload,
    session_instance: session.instance
  });

  const received = session.readPronoteFunctionPayload<PronoteApiLoginInformations["response"]>(response.payload);

  return res.success({
    session: session.exportToObject(),
    received,

    setup: session_data.e !== undefined && session_data.f !== undefined
      ? {
        username: session_data.e,
        password: session_data.f
      }
      : undefined
  });
});
