import { PronoteApiFunctions, PronoteApiOnglets } from "@/types/pronote_api";
import type { SessionExported } from "@/utils/session";

export interface PronoteApiUserHomeworks {
  request: {
    _Signature_: {
      onglet: PronoteApiOnglets.Homeworks;
    }

    donnees: {
      domaine: {
        _T: 8;
        /** You put the week you want to get between the brackets. */
        V: `[${number}]`;
      }
    }
  }

  response: {
    nom: PronoteApiFunctions.Homeworks;
    donnees: {
      ListeTravauxAFaire: {
        _T: 24;
        V: {
					/** ID of the homwork. */
          N: string;

          /** Content of the homework. */
          descriptif: {
            _T: number;
            /** This is actually HTML, use innerHTML to render the content. */
            V: string;
          }

          avecMiseEnForme: boolean;

          /** Due date for the homework. */
          PourLe: {
            _T: 7;
            /** Date format is "DD/MM/YYYY". */
            V: string;
          }

          /** When the work has been done. */
          TAFFait: boolean;

          niveauDifficulte: number;
          duree: number;

          cahierDeTextes: {
            _T: 24;
            V: {
              N: string;
            }
          }

          cours: {
            _T: 24,
            V: {
              N: string;
            }
          }

          /** When the homework has been given. */
          DonneLe: {
            _T: 7;
            /** Date format is "DD/MM/YYYY". */
            V: string;
          }

          Matiere: {
            _T: 24;
            V: {
              /** Name of the subject. */
              L: string;
              N: string;
            }
          }

          /** HEX value of the background color given on Pronote. */
          CouleurFond: string;

          nomPublic: string;
          ListeThemes: {
            _T: 24;
            V: unknown[];
          }

          libelleCBTheme: string;

          /** Attachments. */
          ListePieceJointe: {
            _T: 24;
            V: {
							G: number;
							/** Name of the attachment. */
							L: string;
							/** ID of the attachment. */
							N: string;
						}[];
          }
        }[];
      }
    }
  }
}

type ApiUserHomeworksPath = `/user/homeworks/${number}`;
export interface ApiUserHomeworks {
  request: {
    session: SessionExported;
  }

  response: {
    received: PronoteApiUserHomeworks["response"];
    session: SessionExported;
  }

  path: ApiUserHomeworksPath;
}
