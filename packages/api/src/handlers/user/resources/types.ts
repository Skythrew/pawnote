import { PronoteApiFunctions, PronoteApiOnglets } from "@/utils/requests/pronote";
import { SessionExportedSchema, type SessionExported } from "@/utils/session";
import { z } from "zod";

export const ApiUserResourcesRequestSchema = z.object({
  session: SessionExportedSchema
});

export interface PronoteApiUserResources {
  request: {
    _Signature_: {
      onglet: PronoteApiOnglets.Resources
    }

    donnees: {
      domaine: {
        _T: 8
        /** You put the week you want to get between the brackets. */
        V: `[${number}]`
      }
    }
  }

  response: {
    nom: PronoteApiFunctions.Resources
    donnees: {
      ListeCahierDeTextes: {
        _T: 24
        V: Array<{
          N: string
          verrouille: boolean

          cours: {
            _T: 24
            V: {
              N: string
            }
          }

          listeGroupes: {
            _T: 24
            V: unknown[]
          }

          Matiere: {
            _T: 24
            V: {
              /** Subject's name. */
              L: string
              N: string
            }
          }

          /** HEX color given in Pronote. */
          CouleurFond: string

          listeProfesseurs: {
            _T: 24
            V: Array<{
              /** Teacher's name. */
              L: string
              N: string
            }>
          }

          Date: {
            _T: 7
            /** Date in format "DD/MM/YYYY HH:mm:ss". */
            V: string
          }

          DateFin: {
            _T: 7
            /** Date in format "DD/MM/YYYY HH:mm:ss". */
            V: string
          }

          listeContenus: {
            _T: 24
            V: Array<{
              N: string

              descriptif: {
                _T: 21
                V: string
              }

              categorie: {
                _T: 24
                V: {
                  N: string
                  G: number
                }
              }

              ListeThemes: {
                _T: 24
                V: unknown[]
              }

              libelleCBTheme: string
              parcoursEducatif: number

              ListePieceJointe: {
                _T: 24
                V: Array<{
                  /** Name of the attachment. */
                  L: string
                  N: string
                  G: number
                }>
              }

              training: {
                _T: 24
                V: {
                  ListeExecutionsQCM: unknown[]
                }
              }
            }>
          }

          listeElementsProgrammeCDT: {
            _T: 24
            V: unknown[]
          }
        }>
      }

      ListeRessourcesPedagogiques: {
        _T: 24
        V: {
          listeRessources: {
            _T: 24
            V: Array<{
              G: number

              ressource: {
                _T: 24
                V: {
                  /** Ressource's name. */
                  L: string
                  N: string
                  G: number
                }
              }

              ListeThemes: {
                _T: 24
                V: unknown[]
              }

              date: {
                _T: 7
                /** Date in format "DD/MM/YYYY HH:mm:ss". */
                V: string
              }

              matiere: {
                _T: 24
                V: {
                  N: string
                }
              }
            }>
          }

          listeMatieres: {
            _T: 24
            V: Array<{
              /** Name of the subject. */
              L: string
              N: string
              G: number
              /** HEX color given in Pronote. */
              couleur: string
            }>
          }
        }
      }

      ListeRessourcesNumeriques: {
        _T: 24
        V: {
          listeRessources: {
            _T: 24
            V: unknown[]
          }
        }
      }
    }
  }
}

type ApiUserResourcesPath = `/user/resources/${number}`;
export interface ApiUserResources {
  request: z.infer<typeof ApiUserResourcesRequestSchema>

  response: {
    received: PronoteApiUserResources["response"]
    session: SessionExported
  }

  params: {
    week: string
  }

  path: ApiUserResourcesPath
}
