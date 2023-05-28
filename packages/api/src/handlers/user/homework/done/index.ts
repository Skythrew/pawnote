import type { PronoteApiUserHomeworkDone, ApiUserHomeworkDone } from "./types";
import { ApiUserHomeworkDoneRequestSchema } from "./types";

import { createApiFunction } from "@/utils/handlers/create";
import { ApiResponseErrorCode } from "@/utils/handlers/errors";

import { PronoteApiFunctions, PronoteApiOnglets } from "@/utils/requests/pronote";
import { createPronoteAPICall } from "@/utils/requests/pronote";
import { Session } from "@/utils/session";

import { z } from "zod";

export default createApiFunction<ApiUserHomeworkDone>(ApiUserHomeworkDoneRequestSchema, async (req, res) => {
  const homework_id = req.params.homework_id;
  const homework_id_check = (z.string()).safeParse(homework_id);

  if (!homework_id_check.success) return res.error({
    code: ApiResponseErrorCode.InvalidRequestBody,
    debug: { homework_id, error: homework_id_check.error.toString() }
  }, { status: 400 });

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

  const response = await createPronoteAPICall(req.fetch)(PronoteApiFunctions.HomeworkDone, {
    session_instance: session.instance,
    payload: request_payload,
    user_agent: req.userAgent
  });

  const received = session.readPronoteFunctionPayload<PronoteApiUserHomeworkDone["response"]>(response.payload);

  return res.success({
    received,
    session: session.exportToObject()
  });
});
