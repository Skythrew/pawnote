import { type ApiUserTimetable, handlers } from "@pawnote/api";
import { handleServerRequest } from "@/utils/server";

export const POST = handleServerRequest<ApiUserTimetable>(async (req, res) => {
  const api = await handlers.user.timetable(req.fetcher, req.body, { week: req.params.week });
  return res.from(api);
});
