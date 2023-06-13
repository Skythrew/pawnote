import { type ApiLoginEntCookies, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiLoginEntCookies>(async (req, res) => {
  const api = await handlers.login.ent_cookies(req.fetcher, req.body, {});
  return res.from(api);
});
