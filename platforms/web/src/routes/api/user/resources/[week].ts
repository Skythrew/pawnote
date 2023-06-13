import { type ApiUserResources, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiUserResources>(async (req, res) => {
  const api = await handlers.user.resources(req.fetcher, req.body, { week: req.params.week });
  return res.from(api);
});
