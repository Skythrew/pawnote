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

export interface PronoteApiGeolocation {
  request: {
    nomFonction: "geoLoc";
    lat: string;
    long: string;
  }

  response: {
    url: string; // "https://0190027B.index-education.net/pronote",
    nomEtab: string; // "LYCEE PROF. MARCEL BARBANCEYS",
    lat: string; //"45.380878662",
    long: string; // "2.274143683",
    cp: string; //"19160"
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
