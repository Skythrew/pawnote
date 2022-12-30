import { type ApiInstance, ResponseErrorCode, handlers } from "@pornote/api";

import { handleServerRequest } from "@/utils/server";
import { objectHasProperty } from "@/utils/globals";

export const POST = handleServerRequest<ApiInstance>(async (req, res) => {
  if (!objectHasProperty(req.body, "pronote_url"))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: req.body }
    }, { status: 400 });

  const api = await handlers.instance(req.fetcher, req.body);
  return res.from(api);
});
