import { type ApiGeolocation, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiGeolocation>(async (req, res) => {
  const api = await handlers.geolocation(req.fetcher, req.body, {});
  return res.from(api);
});
