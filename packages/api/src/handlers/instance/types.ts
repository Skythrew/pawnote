import type { PronoteApiAccountId } from "@/utils/requests/pronote";
import { z } from "zod";

export const ApiInstanceRequestSchema = z.object({
  pronote_url: z.string()
});

export interface PronoteApiInstance {
  request: Record<string, never>

  response: {
    version: number[]
    date: string
    CAS: { actif: false } | { actif: true, casURL: string, jetonCAS: string }
    espaces: Array<{ nom: string, URL: string }>
    nomEtab: string
  }
}

export interface ApiInstance {
  request: z.infer<typeof ApiInstanceRequestSchema>

  response: {
    school_name: string

    accounts: Array<{
      name: string
      id: PronoteApiAccountId
    }>

    /** Base URL of the instance. */
    pronote_url: string

    /** URL of the ENT we have to handle. */
    ent_url?: string
    /** Used to generate new temporary passwords for Pronote after ENT login. */
    ent_token?: string
  }

  path: "/instance"
}
