import type { PronoteApiLoginInformations } from "@/types/pronote";
import type { ApiLoginInformations } from "@/types/api";
import { PronoteApiFunctions } from "@/types/pronote";

import {
  extractPronoteSessionFromBody,
  downloadPronotePage,
  handleServerRequest,
  cleanPronoteUrl,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";

import Session from "@/utils/session";
import forge from "node-forge";

export const POST = handleServerRequest<ApiLoginInformations["response"]>(async (req, res) => {
  const body = await req.json() as ApiLoginInformations["request"];

  if (!objectHasProperty(body, "pronote_url") || !objectHasProperty(body, "account_type"))
    return res.error({
      message: "Missing 'pronote_url' and/or 'account_type'.",
      debug: { received_body: body }
    }, { status: 400 });

  try {
    const pronote_url = cleanPronoteUrl(body.pronote_url);
    const account_type = PRONOTE_ACCOUNT_TYPES[body.account_type];

    // Don't clean the URL when `raw_url` is set to `true`.
    const pronote_page_url = body.raw_url && body.raw_url === true
      ? body.pronote_url
      : pronote_url + `/${account_type.path}?login=true`;

    const pronote_page = await downloadPronotePage(pronote_page_url, body.cookies);

    // Check if the Pronote page has been correctly downloaded.
    if (pronote_page === null) return res.error({
      message: "Error while downloading the Pronote page.",
      debug: {
        pronote_page_url,
        pronote_page
      }
    });

    // We extract session from the downloaded Pronote page.
    const session_data = extractPronoteSessionFromBody(pronote_page.body);
    if (typeof session_data === "string") return res.error({
      message: session_data,
      debug: {
        pronote_page_url,
        pronote_page
      }
    });

    if (session_data === null) return res.error({
      message: "Error while parsing session data.",
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
      message: "IV for the AES encryption wasn't created.",
      debug: {
        pronote_page,
        pronote_page_url,
        encryption: session.encryption
      }
    }, { status: 500 });

    // Create "Uuid" property for the request.
    const rsa_uuid = forge.util.encode64(rsa_key.encrypt(aes_iv), 64);

    const cookies = body.cookies ?? [];
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
      session_instance: session.instance
    });

    if (response === null) return res.error({
      message: "A network error happened, please retry."
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiLoginInformations["response"]>(response.payload);
    if (typeof received === "string") return res.error({
      message: received,
      debug: {
        cookies,
        response,
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
    console.error("[/api/login/informations]", error);
    return res.error({
      message: "Request to Pronote failed.",
      debug: { trace: error }
    });
  }
});

