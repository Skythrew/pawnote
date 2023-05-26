import { PronoteApiAccountId, PronoteApiFunctions } from "@/utils/requests/pronote";
import { SessionExportedSchema, type SessionExported } from "@/utils/session";
import { z } from "zod";

export const ApiLoginAuthenticateRequestSchema = z.object({
  /** Challenge from `ApiLoginIdentify["response"]` solved. */
  solved_challenge: z.string(),

  session: SessionExportedSchema,
  cookies: z.optional(z.array(z.string()))
});

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
  request: z.infer<typeof ApiLoginAuthenticateRequestSchema>

  response: {
    received: PronoteApiLoginAuthenticate["response"];
    session: SessionExported;
  }

  path: "/login/authenticate";
}
