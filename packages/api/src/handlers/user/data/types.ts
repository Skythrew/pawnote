import { PronoteApiFunctions, PronoteApiOnglets } from "@/types/pronote_api";
import type { SessionExported } from "@/utils/session";

export interface PronoteApiUserData {
  request: Record<string, never>;

  response: {
    donnees: {
      ressource: {
        /** Account name. */
        L: string;
        /** Account ID. */
        N: string;

        G: number;
        P: number;

        Etablissement: {
          _T: 24;
          V: {
            /** School name. */
            L: string;
            /** School ID. */
            N: string;
          };
        };

        /** Student have a profile picture. */
        avecPhoto: boolean;

        /** Class of the student. */
        classeDEleve: {
          /** Class name. */
          L: string;
          /** Class ID. */
          N: string;
        };

        listeClassesHistoriques: {
          _T: 24;
          V: {
            /** Class name. */
            L: string;
            /** Class ID. */
            N: string;

            AvecNote: boolean;
            AvecFiliere: boolean;
          }[];
        };

        /** List of student groups. */
        listeGroupes: {
          _T: 24;
          V: {
            /** Group name. */
            L: string;
            /** Group ID. */
            N: string;
          }[];
        };

        listeOngletsPourPiliers: {
          _T: 24;
          V: {
            G: 45;

            listePaliers: {
              _T: 24;
              V: {
                /** Name. */
                L: string;
                /** ID. */
                N: string;

                G: number;

                listePiliers: {
                  _T: 24,
                  V: {
                    /** Name. */
                    L: string;
                    /** ID. */
                    N: string;

                    G: number;
                    P: number;

                    estPilierLVE: boolean;
                    estPersonnalise: boolean;

                    Service?: {
                      _T: 24;
                      V: {
                        /** Name. */
                        L: string;
                        /** ID. */
                        N: string;
                      }
                    }[];
                  };
                };
              }[];
            };
          }
        };

        listeOngletsPourPeriodes: {
          _T: 24;
          V: {
            G: PronoteApiOnglets;

            listePeriodes: {
              T: 24;
              V: {
                /** Name of the period. */
                L: string;
                /** ID of the period. */
                N: string;

                G: number;
                A: boolean;

                GenreNotation: number;
              }[];
            };

            periodeParDefaut: {
              _T: 24;
              V: {
                /** Name of the period. */
                L: string;
                N: string;
              };
            };
          }[];
        };
      };


      /** Informations about school. */
      listeInformationsEtablissements: {
        _T: 24;
        V: {
          /** School name. */
          L: string;
          /** School ID. */
          N: string;

          Logo: {
            _T: 25;
            V: number;
          };

          /** School location. */
          Coordonnees: {
            Adresse1: SVGStringList;
            Adresse2: string;
            CodePostal: string;
            LibellePostal: string;
            LibelleVille: string;
            Province: string;
            Pays: string;
            SiteInternet: string;
          };

          avecInformations: boolean;
        }[];
      };

      /** User settings. */
      parametresUtilisateur: {
        version: number;

        /** Settings for the timetable. */
        EDT: {
          /** Show canceled classes. */
          afficherCoursAnnules: boolean;

          /** Swap time and day position. */
          axeInverseEDT: boolean;
          axeInversePlanningHebdo: boolean;
          axeInversePlanningJour: boolean;
          axeInversePlanningJour2: boolean;

          nbJours: number;
          nbRessources: number;
          nbJoursEDT: number;
          nbSequences: number;
        };

        /** User's current theme. */
        theme: {
          theme: number;
        };

        Communication: {
          DiscussionNonLues: false;
        };
      };

      autorisationsSession: {
        fonctionnalites: {
          gestionTwitter: boolean;
          attestationEtendue: boolean;
        };
      };

      /** Authorization for the current student. */
      autorisations: {
        /** Allow messages tab. */
        AvecDiscussion: boolean;
        /** Allow messages with the staff. */
        AvecDiscussionPersonnels: boolean;
        /** Allow messages with the teachers. */
        AvecDiscussionProfesseurs: boolean;

        incidents: unknown;
        intendance: unknown;
        services: unknown;

        cours: {
          domaineConsultationEDT: {
            _T: 8;
            V: string;
          };

          domaineModificationCours: {
            _T: 8;
            V: string;
          };

          masquerPartiesDeClasse: boolean;
        };

        tailleMaxDocJointEtablissement: number;
        tailleMaxRenduTafEleve: number;

        compte: {
          avecSaisieMotDePasse: boolean;
          avecInformationsPersonnelles: boolean;
        };

        consulterDonneesAdministrativesAutresEleves: boolean;
        autoriserImpression: boolean;
      };

      reglesSaisieMDP: {
        min: number;
        max: number;

        regles: {
          _T: 26;
          /** Array of numbers ? */
          V: string;
        };
      };

      autorisationKiosque: boolean;
      tabEtablissementsModeleGrille: unknown[];

      listeOnglets: {
        G: number;
        Onglet: {
          G: number;
        }[];
      }[];

      listeOngletsInvisibles: number[];
      listeOngletsNotification: number[];
    };

    nom: PronoteApiFunctions.UserData;

    _Signature_: {
      notifications: {
        compteurCentraleNotif: number;
      };

      actualisationMessage: boolean;
      notificationsCommunication: {
        onglet: number;
        nb: number;
      }[];
    };
  }
}

export interface ApiUserData {
  request: {
    session: SessionExported;
  }

  response: {
    received: PronoteApiUserData["response"];
    session: SessionExported;
  }

  path: "/user/data";
}
