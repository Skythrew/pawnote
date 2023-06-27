import { PronoteApiAccountId, PronoteApiFunctions } from "@/utils/requests/pronote";
import { SessionExportedSchema, type SessionExported } from "@/utils/session";
import { z } from "zod";

export const ApiLoginIdentifyRequestSchema = z.object({
  session: SessionExportedSchema,

  /** We should still provide the username since, for now, the `session` object is incomplete. */
  pronote_username: z.string(),
  /** Cookies should be the same as the ones used in `/login/informations` request. */
  cookies: z.array(z.string()),

  /** Whether we use ENT or not. Note that this is relevant only for first-time authentications. */
  useENT: z.boolean(),

  /** When it's the first-time authentication. */
  requestFirstMobileAuthentication: z.boolean(),
  /** When we authenticate reusing a token. */
  reuseMobileAuthentication: z.boolean(),

  deviceUUID: z.string()
});

export interface PronoteApiLoginIdentify {
  request: {
    donnees: {
      genreConnexion: 0
      genreEspace: PronoteApiAccountId
      identifiant: string
      pourENT: boolean
      enConnexionAuto: false
      enConnexionAppliMobile: boolean
      demandeConnexionAuto: false
      demandeConnexionAppliMobile: boolean
      demandeConnexionAppliMobileJeton: boolean
      uuidAppliMobile: string
      loginTokenSAV: string
    }
  }

  response: {
    nom: PronoteApiFunctions.Identify
    donnees: {
      /** String that may be used in the challenge if defined. */
      alea?: string
      /** Challenge to resolve for authentication. */
      challenge: string

      /** When using ENT to log in for the first time, you'll need your account username. */
      login?: string

      /** `1` means that username should be lowercase. */
      modeCompLog?: 0 | 1
      /** `1` means that password should be lowercase. */
      modeCompMdp?: 0 | 1
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
