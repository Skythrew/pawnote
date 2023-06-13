import { type ApiUserData, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiUserData>(async (req, res) => {
  const api = await handlers.user.data(req.fetcher, req.body, {});
  return res.from(api);
});
