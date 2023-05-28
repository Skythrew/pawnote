import type { PronoteApiUserData, ApiUserData } from "@/handlers/user/data/types";
import { PronoteApiOnglets, PronoteApiFunctions } from "@/utils/requests/pronote";
import { SessionExportedSchema, type SessionExported } from "@/utils/session";
import { z } from "zod";

export const ApiUserTimetableRequestSchema = z.object({
  session: SessionExportedSchema,
  resource: z.object({})
});

export enum PronoteApiUserTimetableContentType {
  Subject = 16,
  Teacher = 3,
  Room = 17
}

export interface PronoteApiUserTimetable {
  request: {
    donnees: {
      ressource: PronoteApiUserData["response"]["donnees"]["ressource"];
      Ressource: PronoteApiUserData["response"]["donnees"]["ressource"];

      NumeroSemaine: number;
      numeroSemaine: number;

      avecAbsencesEleve: boolean;
      avecAbsencesRessource: boolean;
      avecConseilDeClasse: boolean;
      avecCoursSortiePeda: boolean;
      avecDisponibilites: boolean;
      avecInfosPrefsGrille: boolean;
      avecRessourcesLibrePiedHoraire: boolean;
      estEDTPermanence: boolean;
    }

    _Signature_: {
      onglet: PronoteApiOnglets.Timetable;
    }
  }

  response: {
    nom: PronoteApiFunctions.Timetable;
    donnees: {
      ParametreExportiCal: string;
      avecExportICal: boolean;

      avecCoursAnnule: boolean;
      debutDemiPensionHebdo: number;
      finDemiPensionHebdo: number;

      prefsGrille: {
        genreRessource: number;
      }

      absences: {
        joursCycle: {
          _T: 24;
          V: {
            jourCycle: number;
            numeroSemaine: number;
          }[];
        }
      }

      recreations: {
        _T: 24;
        V: {
          L: string;
          place: number;
        }[];
      }

      ListeCours: {
        place: number;
        duree: number;

        /** Whether the lesson is canceled or not. */
        estAnnule?: boolean;
        Statut?: string;

        DateDuCours: {
          _T: 7;
          V: string;
        }

        CouleurFond: string;
        ListeContenus: {
          _T: 24,
          V: ({ L: string } & (
            | {
              G: PronoteApiUserTimetableContentType.Subject;
              N: string;
            }
            | {
              G: PronoteApiUserTimetableContentType.Room;
              N: string;
            }
            | {
              G: PronoteApiUserTimetableContentType.Teacher;
            }
          ))[];
        };

        N: string;
        P: number;
        G: number;

        AvecTafPublie: boolean;
      }[];
    }
  }
}

type ApiUserTimetablePath = `/user/timetable/${number}`;
export interface ApiUserTimetable {
  request: {
    session: SessionExported;
    resource: ApiUserData["response"]["received"]["donnees"]["ressource"];
  }

  response: {
    received: PronoteApiUserTimetable["response"];
    session: SessionExported;
  }

  params: {
    week: string;
  }

  path: ApiUserTimetablePath;
}
