import { objectHasProperty } from "@/utils/globals";
import { handleServerRequest } from "@/utils/server";

import type { ApiInstance } from "@pornote/api";
import { ResponseErrorCode } from "@/types/errors";
import { instance } from "@pornote/api";

export const POST = handleServerRequest<ApiInstance>(async (req, res) => {
  if (!objectHasProperty(req.body, "pronote_url"))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: req.body }
    }, { status: 400 });

  const api = await instance(async (url) => {
    const response = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": req.user_agent }
    });

    const data = await response.json();
    return data;
  }, {
    pronote_url: req.body.pronote_url
  });

  return res.from(api);
});

