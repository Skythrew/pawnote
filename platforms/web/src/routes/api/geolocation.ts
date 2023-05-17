import { type ApiGeolocation, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiGeolocation>(async (req, res) => {
  const api = await handlers.geolocation(req.fetcher, req.body, {}, req.user_agent);
  return res.from(api);
});
