import type { SessionExported } from "@/types/session";

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
  request: Record<string, never>;

  response: {
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
  }
}

export interface PronoteApiLoginInformations {
	request: unknown;
	response: unknown;
}
