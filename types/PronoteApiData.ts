/**
 * A Pronote Session object extracted
 * from DOM with /utils/api/extractSession.
 */
export type PronoteSession = {
  h: string; // Unique Session ID.
  a: number; // Account Type ID.
  d: boolean; // ??

  // RSA
  MR: string; // Modulus for RSA encryption.
  ER: string; // Exponent for RSA encryption.

  // Options
  sCrA: boolean; // Skip request encryption.
  sCoA: boolean; // Skip request compression.
};

/**
 * An item from results array returned
 * by Pronote when calling their Geolocation API.
 */
export type PronoteApiGeolocationItem = {
  // Global informations.
  url: string; // Pronote Server URL.
  nomEtab: string; // School's name.

  // Geolocation informations.
  lat: string; // School's latitude.
  long: string; // School's longitude.
  cp: string; // School's postal code.
};

// 'FonctionParametres' response common account type (9).
export interface PronoteApiFonctionParametresCommon {
  nom: "FonctionParametres";
  session: number; // Unique session ID.
  numeroOrdre: string;

  donneesSec: {
    nom: "FonctionParametres";

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

      NomEtablissement: string;
      NomEtablissementConnexion: string;

      logo: {
        _T: 25;
        V: number;
      };

      /** Current school year. */
      anneeScolaire: string;

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

      /** Path to the informations page. */
      lienMentions: string;

      /** Available account types. */
      espaces: {
        _T: 24;
        V: {
          /** Acount type ID. */
          G: number;
          /** Acount type name. */
          L: string;
          /** Account type path. */
          url: string;
        }[];
      }
    }
  };

  donneesNonSec: {
    fichiers: string[];
  };
}

// 'FonctionParametres' response student account type (3).
export interface PronoteApiFonctionParametresStudent {
  nom: "FonctionParametres";
  session: number; // Unique session ID.
  numeroOrdre: string;

  donneesSec: {
    nom: "FonctionParametres";

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

        /** Pronote own Epoch (?) */
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

            /** Absolute hour (eg.: `11h30 => false`) ? */
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

            /** Absolute hour (eg.: `11h30 => false`) ? */
            A?: boolean;
          }[];
        };

        sequences: string[];

        ListePeriodes: {
          /** Name of the period. */
          L: string;
          N: string; // ID ?
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
          V: any[]; // Empty array ?
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

  donneesNonSec: {
    fichiers: string[];
  };
}

export interface PronoteApiIdentification {
  donneesSec: {
    nom: "Identification";
    donnees: {
      /** String used in the challenge. */
      alea: string;
      /** Challenge for authentication. */
      challenge: string;

      /** Should lower username. */
      modeCompLog: 0 | 1; // Boolean.
      /** Should lower password. */
      modeCompMdp: 0 | 1; // Boolean.
    }
  };

  nom: "Identification";
  numeroOrdre: string;

  /** Current session ID. */
  session: number;
}