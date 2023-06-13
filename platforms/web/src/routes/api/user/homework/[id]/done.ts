import { type ApiUserHomeworkDone, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiUserHomeworkDone>(async (req, res) => {
  const api = await handlers.user.homework.done(req.fetcher, req.body, { homework_id: req.params.id });
  return res.from(api);
});
