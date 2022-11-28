import type { ApiLoginEntCookies } from "@/types/api";
import { ResponseErrorCode } from "@/types/errors";

import { handleServerRequest } from "@/utils/server";
import { objectHasProperty, credentials } from "@/utils/globals";
import { findENT } from "@/utils/ent";

export const POST = handleServerRequest<ApiLoginEntCookies>(async (req, res) => {
  if (!objectHasProperty(req.body, "ent_url") || !objectHasProperty(req.body, "credentials"))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: req.body }
    }, { status: 400 });

  try {
    const { username, password } = credentials.decode(req.body.credentials);

    const service = findENT(req.body.ent_url);
    if (!service) return res.error({
      code: ResponseErrorCode.NotFoundENT
    }, { status: 404 });

    const cookies = await service.authenticate({ username, password });

    if (cookies === null) return res.error({
      code: ResponseErrorCode.ENTCookiesFetch
    }, { status: 400 });

    return res.success({ ent_cookies: cookies });
  }
  catch (error) {
    console.error("[/api/login/ent_cookies]", error);
    return res.error({
      code: ResponseErrorCode.ENTCookiesFetch,
      debug: { trace: error, body: req.body }
    });
  }
});

