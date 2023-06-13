import { type ApiLoginInformations, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiLoginInformations>(async (req, res) => {
  const api = await handlers.login.informations(req.fetcher, req.body, {});
  return res.from(api);
});
