import { type ApiInstance, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiInstance>(async (req, res) => {
  const api = await handlers.instance(req.fetcher, req.body, {}, req.user_agent);
  return res.from(api);
});
