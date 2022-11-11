import type { PronoteApiUserGrades } from "@/types/pronote";
import type { ApiUserGrades } from "@/types/api";

import { PronoteApiFunctions, PronoteApiOnglets } from "@/types/pronote";
import { ResponseErrorMessage } from "@/types/api";

import {
  handleServerRequest,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiUserGrades["response"]>(async (req, res) => {
  const body = await req.json() as ApiUserGrades["request"];
  const period_id = new URL(req.url).pathname.split("/").pop() as string;

  if (!objectHasProperty(body, "session") || !objectHasProperty(body, "period") || !period_id)
    return res.error({
      message: ResponseErrorMessage.MissingParameters,
      debug: { received_body: body }
    }, { status: 400 });

  if (period_id !== body.period.N) return res.error({
    message: ResponseErrorMessage.IncorrectParameters,
    debug: { url: period_id, body: body.period.N }
  });

  try {
    const session = Session.importFromObject(body.session);

    const request_payload = session.writePronoteFunctionPayload<PronoteApiUserGrades["request"]>({
      donnees: {
        Periode: body.period
      },

      _Signature_: { onglet: PronoteApiOnglets.Grades }
    });
    const response = await callPronoteAPI(PronoteApiFunctions.Grades, {
      session_instance: session.instance,
      payload: request_payload
    });

    if (response === null) return res.error({
      message: ResponseErrorMessage.NetworkFail
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiUserGrades["response"]>(response.payload);
    if (typeof received === "string") return res.error({
      message: received,
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
      message: ResponseErrorMessage.ServerSideError,
      debug: { trace: error }
    });
  }
});
