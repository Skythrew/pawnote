import type { PronoteApiUserGrades } from "@/types/pronote";
import type { ApiUserGrades } from "@/types/api";

import { PronoteApiFunctions, PronoteApiOnglets } from "@/types/pronote";
import { ResponseErrorCode } from "@/types/errors";

import {
  handleServerRequest,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiUserGrades>(async (req, res) => {
  const period_id = req.params.period_id as string | undefined;

  if (!objectHasProperty(req.body, "session") || !objectHasProperty(req.body, "period") || !period_id)
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
      payload: request_payload
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
    console.error("[/api/user/homeworks]", error);
    return res.error({
      code: ResponseErrorCode.ServerSideError,
      debug: { trace: error }
    });
  }
});

