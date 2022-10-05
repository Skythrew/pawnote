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

/**
 * Helper type to build body requests types
 * more easily and quickly.
 * `Name` is the `nom` property and `Data` is
 * the typings of what we send to the server.
 */
interface PronoteApiRequestBase<Name extends string, Data> {
  session: number;
  numeroOrdre: string;
  nom: Name;
  /** Data can be a string when encrypted/compresssed. */
  donneesSec: Data | string;
}

export interface PronoteApiInstance {
  request: PronoteApiRequestBase<
    "FonctionParametres",
    {
      TODO: true
    }
  >
}
