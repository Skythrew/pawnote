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

  return res.success({ pronote_url: pronote_url_ticket });
});
