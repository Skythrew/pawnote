import { type ApiGeolocation, ResponseErrorCode, handlers } from "@pawnote/api";

import { handleServerRequest } from "@/utils/server";
import { objectHasProperty } from "@/utils/globals";

export const POST = handleServerRequest<ApiGeolocation>(async (req, res) => {
  if (!objectHasProperty(req.body, "latitude") || !objectHasProperty(req.body, "longitude"))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: req.body }
    }, { status: 400 });

  const api = await handlers.geolocation(req.fetcher, req.body);
  return res.from(api);
});
