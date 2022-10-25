import type { PronoteApiUserData } from "@/types/pronote";
import type { ApiUserData } from "@/types/api";
import { PronoteApiFunctions } from "@/types/pronote";

import {
  handleServerRequest,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiUserData["response"]>(async (req, res) => {
  const body = await req.json() as ApiUserData["request"];

  if (!objectHasProperty(body, "session"))
    return res.error({
      message: "Missing 'session' and/or 'solved_challenge'.",
      debug: { received_body: body }
    }, { status: 400 });

  try {
    const session = Session.importFromObject(body.session);

    const request_payload = session.writePronoteFunctionPayload<PronoteApiUserData["request"]>({});
    const response = await callPronoteAPI(PronoteApiFunctions.UserData, {
      session_instance: session.instance,
      cookies: body.cookies ?? [],
      payload: request_payload
    });

    if (response === null) return res.error({
      message: "A network error happened, please retry."
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiUserData["response"]>(response.payload);
    if (typeof received === "string") return res.error({
      message: received,
      debug: {
        received,
        request_payload,
        cookies: body.cookies
      }
    }, { status: 400 });

    return res.success({
      received,
      cookies: response.cookies,
      session: session.exportToObject()
    });
  }
  catch (error) {
    console.error("[/api/user/data]", error);
    return res.error({
      message: "Request to Pronote failed.",
      debug: { trace: error }
    });
  }
});
