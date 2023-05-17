import { PronoteApiAccountId, PronoteApiFunctions } from "@/types/pronote_api";
import type { SessionExported } from "@/utils/session";

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

export interface ApiLoginAuthenticate {
  request: {
    /** Challenge from `ApiLoginIdentify["response"]` solved. */
    solved_challenge: string;

    session: SessionExported;
    cookies?: string[];
  }

  response: {
    received: PronoteApiLoginAuthenticate["response"];
    session: SessionExported;
  }

  path: "/login/authenticate";
}
