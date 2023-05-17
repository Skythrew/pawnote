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

export interface PronoteApiAccountType {
  id: PronoteApiAccountId;
  name: string;
  path: string;
}

export enum PronoteApiFunctions {
  Informations = "FonctionParametres",
  Identify = "Identification",
  Authenticate = "Authentification",
  UserData = "ParametresUtilisateur",
  Timetable = "PageEmploiDuTemps",
  Homeworks = "PageCahierDeTexte",
  Resources = "PageCahierDeTexte",
  Grades = "DernieresNotes",
  HomeworkDone = "SaisieTAFFaitEleve"
}

export enum PronoteApiOnglets {
  Grades = 198,
  Resources = 89,
  Homeworks = 88,
  Timetable = 16
}

export interface PronoteApiSession {
  /** Session ID as a **string**. */
  h: string;
  /** Account Type ID. */
  a: PronoteApiAccountId;
  /** Whether the instance is demo or not. */
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
