import type { PronoteApiUserData, ApiUserData } from "./types";
import { ApiUserDataRequestSchema } from "./types";

import { PronoteApiFunctions, createPronoteAPICall } from "@/utils/requests/pronote";

import { createApiFunction } from "@/utils/handlers/create";
import { Session } from "@/utils/session";

export default createApiFunction<ApiUserData>(ApiUserDataRequestSchema, async (req, res) => {
  const session = Session.importFromObject(req.body.session);

  const request_payload = session.writePronoteFunctionPayload<PronoteApiUserData["request"]>({});
  const response = await createPronoteAPICall(req.fetch)(PronoteApiFunctions.UserData, {
    session_instance: session.instance,
    payload: request_payload
  });

  const received = session.readPronoteFunctionPayload<PronoteApiUserData["response"]>(response.payload);

  return res.success({
    received,
    session: session.exportToObject()
  });
});
