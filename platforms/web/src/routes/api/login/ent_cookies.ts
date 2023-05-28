import { type ApiLoginEntCookies, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiLoginEntCookies>(async (req, res) => {
  const api = await handlers.login.ent_cookies(req.fetcher, req.body, {}, req.user_agent);
  return res.from(api);
});
