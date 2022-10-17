import type { PronoteApiLoginInformations } from "@/types/pronote";
import type { ApiLoginInformations } from "@/types/api";

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

    const session = Session.from_raw(session_data, {
      pronote_url,
      order: 0,

      ent_cookies: [],
      use_ent: false,
      ent_url: null
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
    const response_payload = await callPronoteAPI("FonctionParametres", {
      cookies,
      pronote_url,
      payload: request_payload,
      session_data: session.data
    });

    const response = session.readPronoteFunctionPayload<PronoteApiLoginInformations["response"]>(response_payload);
    if (typeof response === "string") return res.error({
      message: response,
      debug: {
        request_payload,
        response_payload,
        cookies
      }
    }, { status: 400 });

    return res.success({
      session: session.exportToObject(),
      received: response
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

