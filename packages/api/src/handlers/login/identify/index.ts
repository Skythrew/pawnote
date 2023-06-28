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

  return res.success({
    received,
    session: session.exportToObject()
  });
});
