import type { PronoteApiUserTimetable } from "@/types/pronote";
import type { ApiUserTimetable } from "@/types/api";
import { PronoteApiFunctions } from "@/types/pronote";

import {
  handleServerRequest,
  callPronoteAPI
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";
import Session from "@/utils/session";

export const POST = handleServerRequest<ApiUserTimetable["response"]>(async (req, res) => {
  const body = await req.json() as ApiUserTimetable["request"];
  const week_number = parseInt(new URL(req.url).pathname.split("/").pop() as string);

  if (Number.isNaN(week_number)) return res.error({
    message: "Incorrect 'week' value (NaN) in URL parameters.",
    debug: { url: req.url }
  });

  if (!objectHasProperty(body, "session") || !objectHasProperty(body, "ressource"))
    return res.error({
      message: "Missing 'session' and/or 'ressource'.",
      debug: { received_body: body }
    }, { status: 400 });

  try {
    const session = Session.importFromObject(body.session);

    const request_payload = session.writePronoteFunctionPayload<PronoteApiUserTimetable["request"]>({
      donnees: {
        estEDTPermanence: false,
        avecAbsencesEleve: false,
        avecRessourcesLibrePiedHoraire: false,

        avecAbsencesRessource: true,
        avecInfosPrefsGrille: true,
        avecConseilDeClasse: true,
        avecCoursSortiePeda: true,
        avecDisponibilites: true,

        NumeroSemaine: week_number,
        numeroSemaine: week_number,

        Ressource: body.ressource,
        ressource: body.ressource
      },

      _Signature_: { onglet: 16 }
    });
    const response = await callPronoteAPI(PronoteApiFunctions.Timetable, {
      session_instance: session.instance,
      payload: request_payload
    });

    if (response === null) return res.error({
      message: "A network error happened, please retry."
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiUserTimetable["response"]>(response.payload);
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
    console.error("[/api/user/timetable]", error);
    return res.error({
      message: "Request to Pronote failed.",
      debug: { trace: error }
    });
  }
});
