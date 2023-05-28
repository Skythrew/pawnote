import { type ApiLoginAuthenticate, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiLoginAuthenticate>(async (req, res) => {
  const api = await handlers.login.authenticate(req.fetcher, req.body, {}, req.user_agent);
  return res.from(api);
});
