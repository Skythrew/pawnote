import type { PronoteApiUserTimetable, ApiUserTimetable } from "./types";
import { ApiUserTimetableRequestSchema } from "./types";

import { createApiFunction } from "@/utils/handlers/create";
import { ApiResponseErrorCode } from "@/utils/handlers/errors";

import { PronoteApiFunctions, PronoteApiOnglets, createPronoteAPICall } from "@/utils/requests/pronote";
import { Session } from "@/utils/session";

import { z } from "zod";

export default createApiFunction<ApiUserTimetable>(ApiUserTimetableRequestSchema, async (req, res) => {
  const week_number = parseInt(req.params.week);
  const week_number_check = (z.number().int().positive()).safeParse(week_number);

  if (!week_number_check.success) {
    return res.error({
      code: ApiResponseErrorCode.InvalidRequestBody,
      debug: { week_number, error: week_number_check.error.toString() }
    }, { status: 400 });
  }

  const session = Session.importFromObject(req.body.session);

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

      Ressource: req.body.resource,
      ressource: req.body.resource
    },

    _Signature_: { onglet: PronoteApiOnglets.Timetable }
  });

  const response = await createPronoteAPICall(req.fetch)(PronoteApiFunctions.Timetable, {
    session_instance: session.instance,
    payload: request_payload
  });

  const received = session.readPronoteFunctionPayload<PronoteApiUserTimetable["response"]>(response.payload);

  return res.success({
    received,
    session: session.exportToObject()
  });
});
