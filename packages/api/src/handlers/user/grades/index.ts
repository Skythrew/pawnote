import type { PronoteApiUserGrades, ApiUserGrades } from "./types";
import { ApiUserGradesRequestSchema } from "./types";

import { PronoteApiFunctions, PronoteApiOnglets, createPronoteAPICall } from "@/utils/requests/pronote";
import { ApiResponseErrorCode } from "@/utils/handlers/errors";

import { createApiFunction } from "@/utils/handlers/create";
import { Session } from "@/utils/session";

import { z } from "zod";

export default createApiFunction<ApiUserGrades>(ApiUserGradesRequestSchema, async (req, res) => {
  const period_id = req.params.period_id;
  const period_id_check = (z.string()).safeParse(period_id);

  if (!period_id_check.success) {
    return res.error({
      code: ApiResponseErrorCode.InvalidRequestBody,
      debug: { period_id, error: period_id_check.error.toString() }
    }, { status: 400 });
  }

  const session = Session.importFromObject(req.body.session);

  const request_payload = session.writePronoteFunctionPayload<PronoteApiUserGrades["request"]>({
    donnees: {
      Periode: req.body.period
    },

    _Signature_: { onglet: PronoteApiOnglets.Grades }
  });
  const response = await createPronoteAPICall(req.fetch)(PronoteApiFunctions.Grades, {
    session_instance: session.instance,
    payload: request_payload,
    user_agent: req.userAgent
  });

  const received = session.readPronoteFunctionPayload<PronoteApiUserGrades["response"]>(response.payload);

  return res.success({
    received,
    session: session.exportToObject()
  });
});
