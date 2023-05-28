import { type ApiLoginEntTicket, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiLoginEntTicket>(async (req, res) => {
  const api = await handlers.login.ent_ticket(req.fetcher, req.body, {}, req.user_agent);
  return res.from(api);
});
