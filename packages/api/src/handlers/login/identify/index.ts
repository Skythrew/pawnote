import type { PronoteApiLoginIdentify, ApiLoginIdentify } from "./types";
import { ApiLoginIdentifyRequestSchema } from "./types";

import { createPronoteAPICall, PronoteApiFunctions } from "@/utils/requests/pronote";
import { createApiFunction } from "@/utils/handlers/create";
import { Session } from "@/utils/session";

export default createApiFunction<ApiLoginIdentify>(ApiLoginIdentifyRequestSchema, async (req, res) => {
  const session = Session.importFromObject(req.body.session);

  const request_payload = session.writePronoteFunctionPayload<PronoteApiLoginIdentify["request"]>({
    donnees: {
      genreConnexion: 0,
      genreEspace: session.instance.account_type_id,
      identifiant: req.body.pronote_username,
      pourENT: req.body.useENT,
      enConnexionAuto: false,
      enConnexionAppliMobile: req.body.reuseMobileAuthentication,
      demandeConnexionAuto: false,
      demandeConnexionAppliMobile: req.body.requestFirstMobileAuthentication,
      demandeConnexionAppliMobileJeton: false,
      uuidAppliMobile: req.body.deviceUUID,
      loginTokenSAV: ""
    }
  });

  const response = await createPronoteAPICall(req.fetch)(PronoteApiFunctions.Identify, {
    session_instance: session.instance,
    cookies: req.body.cookies ?? [],
    payload: request_payload
  });

  const received = session.readPronoteFunctionPayload<PronoteApiLoginIdentify["response"]>(response.payload);

  // Update the username in the session.
  // When using ENT, the username from request body is generated.
  // The response will provide us a `login` property containing the real account username.
  if (req.body.useENT && typeof received.donnees.login === "string") {
    session.instance.pronote_username = received.donnees.login;
  }
  // Otherwise, when not using ENT, the username from request body
  // is directly the real account username.
  else {
    session.instance.pronote_username = req.body.pronote_username;
  }

  // Add device UUID to session object.
  session.instance.device_uuid = req.body.deviceUUID;

  return res.success({
    received,
    session: session.exportToObject()
  });
});
