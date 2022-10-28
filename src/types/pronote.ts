export enum PronoteApiAccountId {
  Commun = 0,
  Eleve = 3,
  Parent = 2,
  Professeur = 1,
  Accompagnant = 25,
  Entreprise = 4,
  VieScolaire = 13,
  Direction = 16,
  Academie = 5
}

export enum PronoteApiFunctions {
  Instance = "FonctionParametres",
  Informations = "FonctionParametres",
  Identify = "Identification",
  Authenticate = "Authentification",
  UserData = "ParametresUtilisateur",
  Timetable = "PageEmploiDuTemps"
}

export interface PronoteApiSession {
  /** Session ID as a **string**. */
  h: string;
  /** Account Type ID. */
  a: PronoteApiAccountId;
  d: boolean;

  /** ENT Username. */
  e?: string;
  /** ENT Password. */
  f?: string;
  g?: number;

  /** Modulus for RSA encryption. */
  MR: string;
  /** Exponent for RSA encryption. */
  ER: string;

  /** Skip request encryption. */
  sCrA: boolean;
  /** Skip request compression. */
  sCoA: boolean;
}

export interface PronoteApiFunctionPayload<T> {
  nom: string;
  session: number;
  numeroOrdre: string;

  /** `string` only when compressed and/or encrypted. */
  donneesSec: T | string;
}

export interface PronoteApiFunctionError {
  Erreur: {
    G: number;
    Message: string;
    Titre: string;
  }
}

export interface PronoteApiGeolocation {
  request: {
    nomFonction: "geoLoc";
    lat: string;
    long: string;
  }

  response: {
    url: string;
    nomEtab: string;
    lat: string;
    long: string;
    cp: string;
  }[] | Record<string, unknown> // `{}` when no results.
}

export interface PronoteApiInstance {
  request: Record<string, never>;

  response: {
		nom: PronoteApiFunctions.Instance;

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
  }
}

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

export interface PronoteApiLoginIdentify {
  request: {
    donnees: {
      genreConnexion: 0;
      genreEspace: PronoteApiAccountId;
      identifiant: string;
      pourENT: boolean;
      enConnexionAuto: false;
      demandeConnexionAuto: false;
      demandeConnexionAppliMobile: false;
      demandeConnexionAppliMobileJeton: false;
      uuidAppliMobile: string;
      loginTokenSAV: string;
    }
  }

  response: {
    nom: PronoteApiFunctions.Identify;
    donnees: {
      /** String used in the challenge. */
      alea: string;
      /** Challenge for authentication. */
      challenge: string;

      /** Should lowercase username. */
      modeCompLog: 0 | 1; // Boolean.
      /** Should lowercase password. */
      modeCompMdp: 0 | 1; // Boolean.
    }
  }
}

export interface PronoteApiLoginAuthenticate {
  request: {
    donnees: {
      connexion: 0;
      challenge: string;
      espace: PronoteApiAccountId;
    }
  }

  response: {
    nom: PronoteApiFunctions.Authenticate;
    donnees: {
      /** AES encryption key to use from now on. */
      cle: string;

      /** Last authentication date. */
      derniereConnexion: {
        _T: 7;
        V: string;
      };

      /** Name of the authenticated user. */
      libelleUtil: string;
      modeSecurisationParDefaut: number;
    }
  }
}

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
            G: number;

            listePeriodes: {
              T: 24;
              V: {
                /** Name. */
                L: string;
                /** ID. */
                N: string;

                G: number;
                A: boolean;

                GenreNotation: number;
              }[];
            };

            periodeParDefaut: {
              _T: 24;
              V: {
                /** Name. */
                L: string;
                /** ID. */
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
      onglet: 16;
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
