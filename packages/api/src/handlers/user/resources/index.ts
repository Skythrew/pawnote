import type { PronoteApiUserResources, ApiUserResources } from "./types";
import { ApiUserResourcesRequestSchema } from "./types";

import { createApiFunction } from "@/utils/handlers/create";
import { ApiResponseErrorCode } from "@/utils/handlers/errors";

import { PronoteApiFunctions, PronoteApiOnglets, createPronoteAPICall } from "@/utils/requests/pronote";
import { Session } from "@/utils/session";

import { z } from "zod";

export default createApiFunction<ApiUserResources>(ApiUserResourcesRequestSchema, async (req, res) => {
  const week_number = parseInt(req.params.week);
  const week_number_check = (z.number().int().positive()).safeParse(week_number);

  if (!week_number_check.success) {
    return res.error({
      code: ApiResponseErrorCode.InvalidRequestBody,
      debug: { week_number, error: week_number_check.error.toString() }
    }, { status: 400 });
  }

  const session = Session.importFromObject(req.body.session);

  const request_payload = session.writePronoteFunctionPayload<PronoteApiUserResources["request"]>({
    donnees: {
      domaine: {
        _T: 8,
        V: `[${week_number}]`
      }
    },

    _Signature_: { onglet: PronoteApiOnglets.Resources }
  });

  const response = await createPronoteAPICall(req.fetch)(PronoteApiFunctions.Resources, {
    session_instance: session.instance,
    payload: request_payload,
    user_agent: req.userAgent
  });

  const received = session.readPronoteFunctionPayload<PronoteApiUserResources["response"]>(response.payload);

  return res.success({
    received,
    session: session.exportToObject()
  });
});
