import { PronoteApiAccountId, PronoteApiFunctions } from "@/types/pronote_api";
import type { SessionExported } from "@/utils/session";

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

export interface ApiLoginIdentify {
  request: {
    pronote_username: string;

    session: SessionExported;
    cookies?: string[];
  }

  response: {
    received: PronoteApiLoginIdentify["response"];
    session: SessionExported;
  }

  path: "/login/identify";
}
