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
  Informations = "FonctionParametres",
  Identify = "Identification",
  Authenticate = "Authentification",
  UserData = "ParametresUtilisateur",
  Timetable = "PageEmploiDuTemps",
  Homeworks = "PageCahierDeTexte",
  Ressources = "PageCahierDeTexte",
  Grades = "DernieresNotes",
  HomeworkDone = "SaisieTAFFaitEleve"
}

export enum PronoteApiOnglets {
  Grades = 198,
  Ressources = 89,
  Homeworks = 88,
  Timetable = 16
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

export interface PronoteApiUserRessources {
  request: {
    _Signature_: {
      onglet: PronoteApiOnglets.Ressources;
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
    nom: PronoteApiFunctions.Ressources;
    donnees: {
      ListeCahierDeTextes: {
        _T: 24;
        V: {
          N: string;
          verrouille: boolean;

          cours: {
            _T: 24;
            V: {
              N: string;
            }
          }

          listeGroupes: {
            _T: 24;
            V: unknown[];
          }

          Matiere: {
            _T: 24;
            V: {
              /** Subject's name. */
              L: string;
              N: string;
            };
          }

          /** HEX color given in Pronote. */
          CouleurFond: string;

          listeProfesseurs: {
            _T: 24;
            V: {
              /** Teacher's name. */
              L: string;
              N: string;
            }[];
          }

          Date: {
            _T: 7;
            /** Date in format "DD/MM/YYYY HH:mm:ss". */
            V: string;
          }

          DateFin: {
            _T: 7;
            /** Date in format "DD/MM/YYYY HH:mm:ss". */
            V: string;
          }

          listeContenus: {
            _T: 24;
            V: {
              N: string;

              descriptif: {
                _T: 21;
                V: string;
              }

              categorie: {
                _T: 24;
                V: {
                  N: string;
                  G: number;
                }
              }

              ListeThemes: {
                _T: 24;
                V: unknown[];
              }

              libelleCBTheme: string;
              parcoursEducatif: number;

              ListePieceJointe: {
                _T: 24;
                V: {
                  /** Name of the attachment. */
                  L: string;
                  N: string;
                  G: number;
                }[];
              }

              training: {
                _T: 24;
                V: {
                  ListeExecutionsQCM: unknown[]
                };
              }
            }[];
          }

          listeElementsProgrammeCDT: {
            _T: 24;
            V: unknown[];
          }
        }[];
      }

      ListeRessourcesPedagogiques: {
        _T: 24;
        V: {
          listeRessources: {
            _T: 24;
            V: {
              G: number;

              ressource: {
                _T: 24;
                V: {
                  /** Ressource's name. */
                  L: string;
                  N: string;
                  G: number;
                }
              }

              ListeThemes: {
                _T: 24;
                V: unknown[];
              }

              date: {
                _T: 7;
                /** Date in format "DD/MM/YYYY HH:mm:ss". */
                V: string;
              }

              matiere: {
                _T: 24;
                V: {
                  N: string;
                }
              }
            }[];
          }

          listeMatieres: {
            _T: 24;
            V: {
              /** Name of the subject. */
              L: string;
              N: string;
              G: number;
              /** HEX color given in Pronote. */
              couleur: string;
            }[];
          }
        }
      }

      ListeRessourcesNumeriques: {
        _T: 24;
        V: {
          listeRessources: {
            _T: 24;
            V: unknown[];
          }
        }
      }
    }
  }
}

export interface PronoteApiUserGrades {
  request: {
    _Signature_: {
      onglet: PronoteApiOnglets.Grades;
    }

    donnees: {
      Periode: PronoteApiUserData["response"]["donnees"]["ressource"]["listeOngletsPourPeriodes"]["V"][number]["listePeriodes"]["V"][number];
    }
  }

  response: {
    nom: PronoteApiFunctions.Grades;
    donnees: {
      moyGenerale: {
        _T: 10;
        V: string;
      }
      moyGeneraleClasse: {
        _T: 10;
        V: string;
      }

      baremeMoyGenerale: {
        _T: 10;
        V: string;
      }

      baremeMoyGeneraleParDefaut: {
        _T: 10;
        V: string;
      }

      avecDetailDevoir: boolean;
      avecDetailService: boolean;

      listeServices: {
        _T: 24;
        V: {
          /** Name of the service/subject. */
          L: string;
          N: string;
          G: number;
          ordre: number;

          estServiceEnGroupe: boolean;

          moyEleve: {
            _T: 10;
            V: string;
          }

          baremeMoyEleve: {
            _T: 10;
            V: string;
          }

          baremeMoyEleveParDefaut: {
            _T: 10;
            V: string;
          }

          moyClasse: {
            _T: 10;
            V: string;
          }

          moyMin: {
            _T: 10;
            V: string;
          }

          moyMax: {
            _T: 10;
            V: string;
          }

          /** HEX color given in Pronote. */
          couleur: string;
        }[];
      }

      listeDevoirs: {
        _T: 24;
        V: {
          N: string;
          G: number;

          note: {
            _T: number;
            /** Grade the user had. */
            V: string;
          }

          bareme: {
            _T: 10;
            /** The maximum grade value. */
            V: string;
          }

          baremeParDefaut: {
            _T: 10;
            V: string;
          }

          date: {
            _T: 7;
            /** Date in "DD/MM/YYYY" format. */
            V: string;
          }

          service: {
            _T: 24;
            V: {
              L: string;
              N: string;
              G: 12;
              couleur: string;
            }
          }

          periode: {
            _T: 24;
            V: {
              L: string;
              N: string;
            }
          }

          ListeThemes: {
            _T: 24;
            V: unknown[];
          }

          moyenne: {
            _T: 10;
            /** Overall grade on this exam. */
            V: string;
          }

          estEnGroupe: boolean;

          noteMax: {
            _T: 10;
            /** Best grade someone had. */
            V: string;
          }

          noteMin: {
            _T: 10;
            /** Worst grade someone had. */
            V: string;
          }

          /** Description of the exam. */
          commentaire: string;

          coefficient: number;
          estFacultatif: boolean;
          estBonus: boolean;
          estRamenerSur20: boolean;

          /** Available when the grade was based on a quiz. */
          executionQCM?: {
            _T: 24;
            V: {
              N: string;
              G: number;
              QCM: {
                _T: 24,
                V: {
                  /** Name of the quiz. */
                  L: string;
                  N: string;
                  G: number;
                  /** Number of questions. */
                  nbQuestionsTotal: number;
                  /** Maximum amout of points. */
                  nombreDePointsTotal: number;
                  avecQuestionsSoumises: boolean;
                  nombreQuestObligatoires: number;
                  nbCompetencesTotal: number;
                }
              }

              ListeThemes: {
                _T: 24;
                V: unknown[];
              }

              fichierDispo: boolean;
              estEnPublication: boolean;

              dateDebutPublication: {
                _T: 7;
                /** Date in format "DD/MM/YYYY HH:mm:ss". */
                V: string;
              }

              dateFinPublication: {
                _T: 7;
                /** Date in format "DD/MM/YYYY HH:mm:ss". */
                V: string;
              }

              consigne: {
                _T: 21;
                V: string;
              }

              estLieADevoir: boolean;
              estLieAEvaluation: boolean;
              estUnTAF: boolean;
              estSupprimable: boolean;
              estDemarre: boolean;
              etatCloture: number;
              nbQuestRepondues: number;
              nbQuestBonnes: number;

              noteQCM: {
                _T: 10;
                V: string;
              }

              autoriserLaNavigation: boolean;
              homogeneiserNbQuestParNiveau: boolean;
              melangerLesQuestionsGlobalement: boolean;
              melangerLesQuestionsParNiveau: boolean;
              melangerLesReponses: boolean;
              ressentiRepondant: boolean;
              publierCorrige: boolean;
              tolererFausses: boolean;
              acceptIncomplet: boolean;
              pointsSelonPourcentage: boolean;
              afficherResultatNote: boolean;
              afficherResultatNiveauMaitrise: boolean;

              modeDiffusionCorrige: number;
              nombreQuestionsSoumises: number;
              dureeMaxQCM: number;
              nombreDePoints: number;

              listeProfesseurs: {
                _T: 24;
                V: {
                    L: string;
                    N: string;
                }[];
              }

              ramenerSur20: boolean;
              service: {
                _T: 24;
                V: {
                  L: string;
                  N: string;
                }
              }

              coefficientDevoir: {
                _T: 10;
                V: string;
              }

              nomPublic: string;
            }
          }
        }[];
      }
    }
  }
}

export interface PronoteApiUserHomeworkDone {
  request: {
		_Signature_: {
			onglet: PronoteApiOnglets.Homeworks;
		}

    donnees: {
      listeTAF: {
        /** ID of the homework. */
        N: string;
        E: 2; // Why 2 ? I don't even know.
        /** Homework has been done or not. */
        TAFFait: boolean;
      }[];
    }
  }

  response: {
    nom: PronoteApiFunctions.HomeworkDone;
    RapportSaisie: Record<string, never>;
    donnees: Record<string, never>;
  }
}
