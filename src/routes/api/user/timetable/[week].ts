import type { PronoteApiUserTimetable } from "@/types/pronote";
import type { ApiUserTimetable } from "@/types/api";

import { PronoteApiFunctions, PronoteApiOnglets } from "@/types/pronote";
import { ResponseErrorCode } from "@/types/errors";

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
    code: ResponseErrorCode.IncorrectParameters,
    debug: { url: req.url, week_number }
  });

  if (!objectHasProperty(body, "session") || !objectHasProperty(body, "ressource"))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
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

      _Signature_: { onglet: PronoteApiOnglets.Timetable }
    });
    const response = await callPronoteAPI(PronoteApiFunctions.Timetable, {
      session_instance: session.instance,
      payload: request_payload
    });

    if (response === null) return res.error({
      code: ResponseErrorCode.NetworkFail
    }, { status: 500 });

    const received = session.readPronoteFunctionPayload<PronoteApiUserTimetable["response"]>(response.payload);
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
    console.error("[/api/user/timetable]", error);
    return res.error({
      code: ResponseErrorCode.ServerSideError,
      debug: { trace: error }
    });
  }
});
