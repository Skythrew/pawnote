import { type ApiUserHomeworks, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiUserHomeworks>(async (req, res) => {
  const api = await handlers.user.homeworks(req.fetcher, req.body, { week: req.params.week });
  return res.from(api);
});
