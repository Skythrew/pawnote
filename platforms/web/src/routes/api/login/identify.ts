import { type ApiLoginIdentify, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiLoginIdentify>(async (req, res) => {
  const api = await handlers.login.identify(req.fetcher, req.body, {});
  return res.from(api);
});
