import type { ApiLoginEntTicket } from "@/types/api";
import { ResponseErrorMessage } from "@/types/api";

import { handleServerRequest } from "@/utils/server";
import { objectHasProperty } from "@/utils/globals";
import { findENT } from "@/utils/ent";

export const POST = handleServerRequest<ApiLoginEntTicket["response"]>(async (req, res) => {
  const body = await req.json() as ApiLoginEntTicket["request"];

  if (!objectHasProperty(body, "ent_url") || !objectHasProperty(body, "ent_cookies"))
    return res.error({
      message: ResponseErrorMessage.MissingParameters,
      debug: { received_body: body }
    }, { status: 400 });

  try {
    const service = findENT(body.ent_url);
    if (!service) return res.error({
      message: ResponseErrorMessage.NotFoundENT
    }, { status: 404 });

    const pronote_url = await service.process_ticket({
      ent_cookies: body.ent_cookies
    });

    if (pronote_url === null) return res.error({
      message: ResponseErrorMessage.PronoteTicketFetch
    });

    return res.success({ pronote_url });
  }
  catch (error) {
    console.error("[/api/login/ent_ticket]", error);
    return res.error({
      message: ResponseErrorMessage.PronoteTicketFetch,
      debug: { trace: error, body }
    });
  }
});

