import type { ApiLoginEntCookies } from "@/types/api";

import { handleServerRequest } from "@/utils/server";
import { objectHasProperty } from "@/utils/globals";
import { findENT } from "@/utils/ent";

import forge from "node-forge";

export const POST = handleServerRequest<ApiLoginEntCookies["response"]>(async (req, res) => {
  const body = await req.json() as ApiLoginEntCookies["request"];

  if (!objectHasProperty(body, "ent_url") || !objectHasProperty(body, "credentials"))
    return res.error({
      message: "Missing 'ent_url' and/or 'credentials'.",
      debug: { received_body: body }
    }, { status: 400 });

  try {
    const [username, password] = forge.util.encodeUtf8(
      forge.util.hexToBytes(
        body.credentials.split("").reverse().join("")
      )
    ).split(":").map(str => forge.util.decode64(str));

    const service = findENT(body.ent_url);
    if (!service) return res.error({
      message: "ENT not available. If you're a developer, please contribute to make a support for your ENT!"
    }, { status: 404 });

    const cookies = await service.authenticate({ username, password });

    if (cookies === null) return res.error({
      message: "Error while fetching the ENT cookies. Maybe bad credentials, please try again."
    }, { status: 400 });

    return res.success({ ent_cookies: cookies });
  }
  catch (error) {
    console.error("[/api/login/ent_cookies]", error);
    return res.error({
      message: "Not able to get ENT cookies.",
      debug: { trace: error, body }
    });
  }
});

