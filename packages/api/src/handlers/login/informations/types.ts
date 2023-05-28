import { PronoteApiFunctions, PronoteApiAccountId } from "@/utils/requests/pronote";
import type { SessionExported } from "@/utils/session";
import { z } from "zod";

export const ApiLoginInformationsRequestSchema = z.object({
  account_type: z.nativeEnum(PronoteApiAccountId),
  pronote_url: z.string(),

  /**
    * Tells the server to not clean the Pronote URL.
    * Defaults to `false`.
    */
  raw_url: z.optional(z.boolean()),

  /**
   * Cookies used when downloading the Pronote page.
   * Required when creating a new session from ENT or an already set-up session.
   *
   * This will append `e` and `f` in to the `setup` object.
   */
  cookies: z.optional(z.array(z.string()))
});

export interface PronoteApiLoginInformations {
	request: {
    donnees: {
      identifiantNav: string | null;
      Uuid: string;
    }
  }

	response: {
    nom: PronoteApiFunctions.Informations;

    _Signature_: {
      ModeExclusif: boolean;
    }

    donnees: {
      identifiantNav: string;

      /** Array of available fonts. */
      listePolices: {
        _T: 24;
        V: {
          L: string;
        }[];
      };

      avecMembre: boolean;
      pourNouvelleCaledonie: boolean;
      genreImageConnexion: number;
      urlImageConnexion: string;
      logoProduitCss: string;

      Theme: number;

      mentionsPagesPubliques: {
        lien: {
          _T: 21;
          V: string;
        }
      }

      /** Server current time when request was made. */
      DateServeurHttp: {
        _T: 7;
        V: string;
      }

      /** Account type path for mobile devices. */
      URLMobile: string;
      /** Know if a mobile version is available. */
      AvecEspaceMobile: boolean;

      /** Current header name. */
      Nom: string;

      General: {
        urlSiteIndexEducation: {
          _T: 23;
          V: string;
        };

        urlSiteInfosHebergement: {
          _T: 23;
          V: string;
        };

        /** Complete version with name of the app.  */
        version: string;
        /** Pronote version. */
        versionPN: string;

        /** Year of the version. */
        millesime: string;

        /** Current language. */
        langue: string;
        /** Current language ID. */
        langID: number;

        /** List of available languages. */
        listeLangues: {
          _T: 24;
          V: {
              langID: number;
              description: string;
          }[];
        };

        lienMentions: string;
        estHebergeEnFrance: boolean;
        avecForum: boolean;

        UrlAide: {
          _T: 23;
          V: string;
        };

        urlAccesVideos: {
          _T: 23;
          V: string;
        };

        urlAccesTwitter: {
          _T: 23;
          V: string;
        };

        urlFAQEnregistrementDoubleAuth: {
          _T: 23;
          V: string;
        };

        urlCanope: {
          _T: 23;
          V: string;
        };

        AvecChoixConnexion: boolean;

        NomEtablissement: string;
        NomEtablissementConnexion: string;

        afficherSemainesCalendaires: 0 | 1; // Boolean.
        AnneeScolaire: string;

        dateDebutPremierCycle: {
          _T: 7;
          V: string;
        }

        PremierLundi: {
          _T: 7;
          V: string;
        }

        PremiereDate: {
          _T: 7;
          V: string;
        }

        DerniereDate: {
          _T: 7;
          V: string;
        }

        PlacesParJour: number;
        PlacesParHeure: number;
        DureeSequence: number;
        PlaceDemiJourneeAbsence: number;
        activationDemiPension: boolean;
        debutDemiPension: number;
        finDemiPension: number;
        AvecHeuresPleinesApresMidi: boolean;

        JourOuvre: {
          _T: 7;
          V: string;
        };

        JourOuvres: {
          _T: 11;
          V: string;
        };

        JoursDemiPension: {
          _T: 26;
          V: string;
        };

        ActivationMessagerieEntreParents: boolean;
        GestionParcoursExcellence: boolean;
        joursOuvresParCycle: number;
        premierJourSemaine: number;
        numeroPremiereSemaine: number;
        grillesEDTEnCycle: number;

        setOfJoursCycleOuvre: {
          _T: 26;
          V: string;
        };

        DemiJourneesOuvrees: {
          _T: 26;
          V: string;
        }[];

        DomainesFrequences: {
          _T: 8;
          V: string;
        }[];

        LibellesFrequences: string[];

        BaremeNotation: {
          _T: 10;
          V: string;
        };

        listeAnnotationsAutorisees: {
          _T: 26;
          V: string;
        };

        ListeNiveauxDAcquisitions: {
          _T: 24;
          V: {
            L: string;
            N: string;
            G: number;
            P: number;

            listePositionnements: {
              _T: 24;
              V: {
                /** Position ID (from 1). */
                G: number;
                /** Position name. */
                L: string;
                abbreviation: string;
              }[];
            };

            positionJauge: number;
            actifPour: {
              _T: 26;
              V: string;
            };
            abbreviation: string;
            raccourci: string;

            /** Color in HEX format. */
            couleur?: string;
            ponderation?: {
              _T: 10;
              V: string;
            };

            nombrePointsBrevet?: {
              _T: 10;
              V: string;
            };

            estAcqui?: boolean;
            estNotantPourTxReussite?: boolean;
          }[];
        };

        AfficherAbbreviationNiveauDAcquisition: boolean;
        AvecEvaluationHistorique: boolean;
        SansValidationNivIntermediairesDsValidAuto: boolean;
        NeComptabiliserQueEvalsAnneeScoDsValidAuto: boolean;
        AvecGestionNiveauxCECRL: boolean;
        couleurActiviteLangagiere: string;
        minBaremeQuestionQCM: number;
        maxBaremeQuestionQCM: number;
        maxNbPointQCM: number;
        tailleLibelleElementGrilleCompetence: number;
        tailleCommentaireDevoir: number;
        AvecRecuperationInfosConnexion: boolean;
        Police: string;
        TaillePolice: number;
        AvecElevesRattaches: boolean;
        maskTelephone: string;
        maxECTS: number;
        TailleMaxAppreciation: number[];

        listeJoursFeries: {
          _T: 24;
          V: {
            /** Name of the day. */
            L: string;
            N: string; // ID (?)

            dateDebut: {
              _T: 7;
              V: string;
            };

            dateFin: {
              _T: 7;
              V: string;
            }
          }[];
        };

        afficherSequences: boolean;

        /** Pronote's Epoch (?) */
        PremiereHeure: {
          _T: 7;
          V: string;
        };

        ListeHeures: {
          _T: 24;
          V: {
            /** ID. */
            G: number;

            /** Hour. */
            L: string;

            A?: boolean;
          }[];
        };

        ListeHeuresFin: {
          _T: 24;
          V: {
            /** ID. */
            G: number;

            /** Hour. */
            L: string;

            A?: boolean;
          }[];
        };

        sequences: string[];

        ListePeriodes: {
          /** Name of the period. */
          L: string;
          /** ID of the period. */
          N: string;
          G: number;

          periodeNotation: number;
          dateDebut: {
            _T: 7;
            V: string;
          };

          dateFin: {
            _T: 7;
            V: string;
          };
        }[];

        logo: {
          _T: 25;
          V: number;
        };

        recreations: {
          _T: 24;
          V: unknown[]; // Empty array ?
        };

        tailleMaxEnregistrementAudioRenduTAF: number;
        genresRenduTAFValable: {
          _T: 26;
          V: string;
        };

        nomCookieAppli: string;
      }
    }
  }
}

export interface ApiLoginInformations {
	request: z.infer<typeof ApiLoginInformationsRequestSchema>

	response: {
		received: PronoteApiLoginInformations["response"];
		session: SessionExported;
    cookies: string[];

    setup?: {
      username: string;
      password: string;
    }
	}

  path: "/login/informations";
}
