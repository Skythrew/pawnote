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

export type PronoteApiFunctions =
  | "FonctionParametres"
  | "Identification"

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
  request: Record<string, never>; // Always empty object.
}
