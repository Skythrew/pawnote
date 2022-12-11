import type { PronoteApiUserHomeworks } from "@/types/pronote";
import type { ApiUserHomeworks } from "@/types/api";

import { PronoteApiFunctions, PronoteApiOnglets } from "@/types/pronote";
import { ResponseErrorCode } from "@/types/errors";

import {
  handleServerRequest,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiUserHomeworks>(async (req, res) => {
  const week_number = parseInt(req.params.week);

  if (Number.isNaN(week_number)) return res.error({
    code: ResponseErrorCode.IncorrectParameters,
    debug: { week_number }
  });

  if (!objectHasProperty(req.body, "session"))
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
      user_agent: req.user_agent
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
    console.error("[/api/user/homeworks]", error);
    return res.error({
      code: ResponseErrorCode.ServerSideError,
      debug: { trace: error }
    });
  }
});

