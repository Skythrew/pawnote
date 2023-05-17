import type { PronoteApiLoginInformations, ApiLoginInformations } from "./types";
import { PronoteApiFunctions } from "@/types/pronote_api";
import { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";

import { createApiFunction, callPronoteAPI, ResponseErrorCode, cleanPronoteUrl } from "@/utils/requests";
import { Session } from "@/utils/session";
import forge from "node-forge";

export default createApiFunction<ApiLoginInformations>(async (req, res) => {
  if (!("pronote_url" in req.body) || !("account_type" in req.body))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: req.body }
    }, { status: 400 });

  try {
    const pronote_url = cleanPronoteUrl(req.body.pronote_url);
    const account_type = PRONOTE_ACCOUNT_TYPES[req.body.account_type];

    // Don't clean the URL when `raw_url` is set to `true`.
    const pronote_page_url = req.body.raw_url && req.body.raw_url === true
      ? req.body.pronote_url
      : pronote_url + `/${account_type.path}?login=true`;

    const pronote_page = await downloadPronotePage({
      url: pronote_page_url,
      cookies: req.body.cookies,
      user_agent: req.userAgent
    });

    // Check if the Pronote page has been correctly downloaded.
    if (pronote_page === null) return res.error({
      code: ResponseErrorCode.PronotePageDownload,
      debug: {
        pronote_page_url,
        pronote_page
      }
    });

    // We extract session from the downloaded Pronote page.
    const session_data = extractPronoteSessionFromBody(pronote_page.body);
    if (typeof session_data === "number") return res.error({
      code: session_data,
      debug: {
        pronote_page_url,
        pronote_page
      }
    });

    if (session_data === null) return res.error({
      code: ResponseErrorCode.SessionReadData,
      debug: {
        pronote_page_url,
        pronote_page
      }
    });

    // We explicitly don't use ENT but we will change this value
    // on the client side to prevent useless API parameters.
    const session = Session.from_raw(session_data, {
      pronote_url,
      ent_url: null,
      use_ent: false
    });

    // Create RSA using given modulos.
    const rsa_key = forge.pki.rsa.setPublicKey(
      new forge.jsbn.BigInteger(session.encryption.rsa.modulus, 16),
      new forge.jsbn.BigInteger(session.encryption.rsa.exponent, 16)
    );

    const aes_iv = session.encryption.aes.iv;
    if (!aes_iv) return res.error({
      code: ResponseErrorCode.NoIVForAESCreated,
      debug: {
        pronote_page,
        pronote_page_url,
        encryption: session.encryption
      }
    }, { status: 500 });

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

    const response = await callPronoteAPI(PronoteApiFunctions.Informations, {
      cookies,
      pronote_url,
      payload: request_payload,
      session_instance: session.instance,
      user_agent: req.userAgent
    });

    if (response === null) return res.error({
      code: ResponseErrorCode.NetworkFail
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiLoginInformations["response"]>(response.payload);
    if (typeof received === "number") return res.error({
      code: received,
      debug: {
        cookies,
        received,
        request_payload
      }
    }, { status: 400 });

    return res.success({
      session: session.exportToObject(),
      cookies: response.cookies,
      received,

      setup: session_data.e && session_data.f ? {
        username: session_data.e,
        password: session_data.f
      } : undefined
    });
  }
  catch (error) {
    return res.error({
      code: ResponseErrorCode.ServerSideError,
      debug: { trace: error }
    });
  }
});
