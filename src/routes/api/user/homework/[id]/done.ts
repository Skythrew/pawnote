import type { PronoteApiUserHomeworkDone } from "@/types/pronote";
import type { ApiUserHomeworkDone } from "@/types/api";

import { PronoteApiFunctions, PronoteApiOnglets } from "@/types/pronote";
import { ResponseErrorCode } from "@/types/errors";

import {
  handleServerRequest,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiUserHomeworkDone["response"]>(async (req, res) => {
  const body = await req.raw.json() as ApiUserHomeworkDone["request"];
  const homework_id = req.params.id as string | undefined;

  if (!homework_id) return res.error({
    code: ResponseErrorCode.IncorrectParameters,
    debug: { homework_id }
  });

  if (!objectHasProperty(body, "session"))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: body }
    }, { status: 400 });

  try {
    const session = Session.importFromObject(body.session);

    const request_payload = session.writePronoteFunctionPayload<PronoteApiUserHomeworkDone["request"]>({
      donnees: {
        listeTAF: [{
          E: 2,
          TAFFait: body.done ?? true,
          N: homework_id
        }]
      },

      _Signature_: {
        onglet: PronoteApiOnglets.Homeworks
      }
    });
    const response = await callPronoteAPI(PronoteApiFunctions.HomeworkDone, {
      session_instance: session.instance,
      payload: request_payload
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
    console.error("[/api/user/homework/[id]/done]", error);
    return res.error({
      code: ResponseErrorCode.ServerSideError,
      debug: { trace: error }
    });
  }
});
