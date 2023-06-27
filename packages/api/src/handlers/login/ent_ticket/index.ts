import type { ApiLoginEntTicket } from "./types";
import { ApiLoginEntTicketRequestSchema } from "./types";

import { createApiFunction } from "@/utils/handlers/create";
import { findENT } from "@/ent";

export default createApiFunction<ApiLoginEntTicket>(ApiLoginEntTicketRequestSchema, async (req, res) => {
  const service = findENT(req.body.ent_url);

  const pronote_url_ticket = await service.process_ticket(req.fetch, {
    ent_cookies: req.body.ent_cookies,
    pronote_url: req.body.pronote_url
  });

  const url = new URL(pronote_url_ticket);
  const lastPath = url.pathname.split("/").pop() as string;
  const indexOfLastSlash = url.pathname.lastIndexOf("/");
  if (!lastPath.includes("mobile.")) {
    url.pathname = url.pathname.slice(0, indexOfLastSlash) + "/mobile." + url.pathname.slice(indexOfLastSlash + 1);
  }

  return res.success({ pronote_url: url.href });
});
