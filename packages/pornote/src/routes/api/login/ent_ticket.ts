import type { ApiLoginEntTicket } from "@/types/api";
import { ResponseErrorCode } from "@/types/errors";

import { handleServerRequest } from "@/utils/server";
import { objectHasProperty } from "@/utils/globals";
import { findENT } from "@/utils/ent";

export const POST = handleServerRequest<ApiLoginEntTicket>(async (req, res) => {
  if (!objectHasProperty(req.body, "ent_url") || !objectHasProperty(req.body, "ent_cookies") || !objectHasProperty(req.body, "pronote_url"))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: req.body }
    }, { status: 400 });

  try {
    const service = findENT(req.body.ent_url);
    if (!service) return res.error({
      code: ResponseErrorCode.NotFoundENT
    }, { status: 404 });

    const pronote_url_ticket = await service.process_ticket({
      ent_cookies: req.body.ent_cookies,
      pronote_url: req.body.pronote_url
    });

    if (pronote_url_ticket === null) return res.error({
      code: ResponseErrorCode.PronoteTicketFetch
    });

    return res.success({ pronote_url: pronote_url_ticket });
  }
  catch (error) {
    console.error("[/api/login/ent_ticket]", error);
    return res.error({
      code: ResponseErrorCode.PronoteTicketFetch,
      debug: { trace: error, body: req.body }
    });
  }
});

