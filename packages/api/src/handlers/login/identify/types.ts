import { PronoteApiAccountId, PronoteApiFunctions } from "@/utils/requests/pronote";
import { SessionExportedSchema, type SessionExported } from "@/utils/session";
import { z } from "zod";

export const ApiLoginIdentifyRequestSchema = z.object({
  pronote_username: z.string(),
  session: SessionExportedSchema,
  cookies: z.array(z.string()),
  useENT: z.boolean(),
  askMobileAuthentication: z.boolean(),
  deviceUUID: z.optional(z.string())
});

export interface PronoteApiLoginIdentify {
  request: {
    donnees: {
      genreConnexion: 0
      genreEspace: PronoteApiAccountId
      identifiant: string
      pourENT: boolean
      enConnexionAuto: false
      demandeConnexionAuto: false
      demandeConnexionAppliMobile: boolean
      demandeConnexionAppliMobileJeton: false
      uuidAppliMobile: string
      loginTokenSAV: string
    }
  }

  response: {
    nom: PronoteApiFunctions.Identify
    donnees: {
      /** String used in the challenge. */
      alea: string
      /** Challenge for authentication. */
      challenge: string

      /** Should lowercase username. */
      modeCompLog: 0 | 1 // Boolean.
      /** Should lowercase password. */
      modeCompMdp: 0 | 1 // Boolean.
    }
  }
}

export interface ApiLoginIdentify {
  request: z.infer<typeof ApiLoginIdentifyRequestSchema>

  response: {
    received: PronoteApiLoginIdentify["response"]
    session: SessionExported
  }

  path: "/login/identify"
}
