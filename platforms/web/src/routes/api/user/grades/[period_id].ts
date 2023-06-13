import { type ApiUserGrades, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiUserGrades>(async (req, res) => {
  const api = await handlers.user.grades(req.fetcher, req.body, { period_id: req.params.period_id });
  return res.from(api);
});
