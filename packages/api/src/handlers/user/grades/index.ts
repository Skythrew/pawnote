import type { PronoteApiUserGrades, ApiUserGrades } from "./types";
import { PronoteApiFunctions, PronoteApiOnglets } from "@/types/pronote_api";

import { createApiFunction, callPronoteAPI, ResponseErrorCode } from "@/utils/requests";
import { Session } from "@/utils/session";

export default createApiFunction<ApiUserGrades>(async (req, res) => {
  const period_id = req.params.period_id as string | undefined;

  if (!("session" in req.body) || !("period" in req.body) || !period_id)
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: req.body }
    }, { status: 400 });

  if (period_id !== req.body.period.N) return res.error({
    code: ResponseErrorCode.IncorrectParameters,
    debug: { url: period_id, body: req.body.period.N }
  });

  try {
    const session = Session.importFromObject(req.body.session);

    const request_payload = session.writePronoteFunctionPayload<PronoteApiUserGrades["request"]>({
      donnees: {
        Periode: req.body.period
      },

      _Signature_: { onglet: PronoteApiOnglets.Grades }
    });
    const response = await callPronoteAPI(PronoteApiFunctions.Grades, {
      session_instance: session.instance,
      payload: request_payload,
      user_agent: req.userAgent
    });

    if (response === null) return res.error({
      code: ResponseErrorCode.NetworkFail
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiUserGrades["response"]>(response.payload);
    if (typeof received === "number") return res.error({
      code: received,
      debug: {
        response,
        request_payload
      }
    }, { status: 400 });

    return res.success({
      received,
      session: session.exportToObject()
    });
  }
  catch (error) {
    return res.error({
      code: ResponseErrorCode.ServerSideError,
      debug: { trace: error }
    });
  }
});
