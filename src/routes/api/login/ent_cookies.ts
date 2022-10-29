import type { ApiLoginEntCookies } from "@/types/api";
import { ResponseErrorMessage } from "@/types/api";

import { handleServerRequest } from "@/utils/server";
import { objectHasProperty, credentials } from "@/utils/globals";
import { findENT } from "@/utils/ent";

export const POST = handleServerRequest<ApiLoginEntCookies["response"]>(async (req, res) => {
  const body = await req.json() as ApiLoginEntCookies["request"];

  if (!objectHasProperty(body, "ent_url") || !objectHasProperty(body, "credentials"))
    return res.error({
      message: ResponseErrorMessage.MissingParameters,
      debug: { received_body: body }
    }, { status: 400 });

  try {
    const { username, password } = credentials.decode(body.credentials);

    const service = findENT(body.ent_url);
    if (!service) return res.error({
      message: ResponseErrorMessage.NotFoundENT
    }, { status: 404 });

    const cookies = await service.authenticate({ username, password });

    if (cookies === null) return res.error({
      message: ResponseErrorMessage.ENTCookiesFetch
    }, { status: 400 });

    return res.success({ ent_cookies: cookies });
  }
  catch (error) {
    console.error("[/api/login/ent_cookies]", error);
    return res.error({
      message: ResponseErrorMessage.ENTCookiesFetch,
      debug: { trace: error, body }
    });
  }
});

