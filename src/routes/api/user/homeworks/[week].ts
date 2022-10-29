import type { PronoteApiUserHomeworks } from "@/types/pronote";
import type { ApiUserHomeworks } from "@/types/api";

import { PronoteApiFunctions, PronoteApiOnglets } from "@/types/pronote";
import { ResponseErrorMessage } from "@/types/api";

import {
  handleServerRequest,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiUserHomeworks["response"]>(async (req, res) => {
  const body = await req.json() as ApiUserHomeworks["request"];
  const week_number = parseInt(new URL(req.url).pathname.split("/").pop() as string);

  if (Number.isNaN(week_number)) return res.error({
    message: ResponseErrorMessage.IncorrectParameters,
    debug: { url: req.url }
  });

  if (!objectHasProperty(body, "session"))
    return res.error({
      message: ResponseErrorMessage.MissingParameters,
      debug: { received_body: body }
    }, { status: 400 });

  try {
    const session = Session.importFromObject(body.session);

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
      payload: request_payload
    });

    if (response === null) return res.error({
      message: ResponseErrorMessage.NetworkFail
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiUserHomeworks["response"]>(response.payload);
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
