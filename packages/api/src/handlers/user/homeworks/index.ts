import type { PronoteApiUserHomeworks, ApiUserHomeworks } from "./types";
import { PronoteApiFunctions, PronoteApiOnglets } from "@/types/pronote_api";

import { createApiFunction, callPronoteAPI, ResponseErrorCode } from "@/utils/requests";
import { Session } from "@/utils/session";

export default createApiFunction<ApiUserHomeworks>(async (req, res) => {
  const week_number = parseInt(req.params.week as string);

  if (Number.isNaN(week_number)) return res.error({
    code: ResponseErrorCode.IncorrectParameters,
    debug: { week_number }
  });

  if (!("session" in req.body))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: req.body }
    }, { status: 400 });

  try {
    const session = Session.importFromObject(req.body.session);

    const request_payload = session.writePronoteFunctionPayload<PronoteApiUserHomeworks["request"]>({
      donnees: {
        domaine: {
          _T: 8,
          V: `[${week_number}]`
        }
      },

      _Signature_: {
        onglet: PronoteApiOnglets.Homeworks
      }
    });
    const response = await callPronoteAPI(PronoteApiFunctions.Homeworks, {
      session_instance: session.instance,
      payload: request_payload,
      user_agent: req.userAgent
    });

    if (response === null) return res.error({
      code: ResponseErrorCode.NetworkFail
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiUserHomeworks["response"]>(response.payload);
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