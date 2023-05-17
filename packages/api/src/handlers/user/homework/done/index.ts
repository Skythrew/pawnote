import type { PronoteApiUserHomeworkDone, ApiUserHomeworkDone } from "./types";
import { PronoteApiFunctions, PronoteApiOnglets } from "@/types/pronote_api";

import { createApiFunction, callPronoteAPI, ResponseErrorCode } from "@/utils/requests";
import { Session } from "@/utils/session";

export default createApiFunction<ApiUserHomeworkDone>(async (req, res) => {
  const homework_id = req.params.homework_id;

  if (!("session" in req.body) || !("done" in req.body) || !homework_id)
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: req.body }
    }, { status: 400 });

  try {
    const session = Session.importFromObject(req.body.session);

    const request_payload = session.writePronoteFunctionPayload<PronoteApiUserHomeworkDone["request"]>({
      donnees: {
        listeTAF: [{
          E: 2,
          TAFFait: req.body.done,
          N: homework_id
        }]
      },

      _Signature_: {
        onglet: PronoteApiOnglets.Homeworks
      }
    });
    const response = await callPronoteAPI(PronoteApiFunctions.HomeworkDone, {
      session_instance: session.instance,
      payload: request_payload,
      user_agent: req.userAgent
    });

    if (response === null) return res.error({
      code: ResponseErrorCode.NetworkFail
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiUserHomeworkDone["response"]>(response.payload);
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
