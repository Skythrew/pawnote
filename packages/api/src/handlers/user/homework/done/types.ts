import { PronoteApiOnglets, PronoteApiFunctions } from "@/utils/requests/pronote";
import { SessionExportedSchema, type SessionExported } from "@/utils/session";
import { z } from "zod";

export const ApiUserHomeworkDoneRequestSchema = z.object({
  session: SessionExportedSchema,
  done: z.boolean()
});

export interface PronoteApiUserHomeworkDone {
  request: {
    _Signature_: {
      onglet: PronoteApiOnglets.Homeworks
    }

    donnees: {
      listeTAF: Array<{
        /** ID of the homework. */
        N: string
        E: 2 // Why 2 ? I don't even know.
        /** Homework has been done or not. */
        TAFFait: boolean
      }>
    }
  }

  response: {
    nom: PronoteApiFunctions.HomeworkDone
    RapportSaisie: Record<string, never>
    donnees: Record<string, never>
  }
}

type ApiUserHomeworkDonePath = `/user/homework/${string}/done`;
export interface ApiUserHomeworkDone {
  request: z.infer<typeof ApiUserHomeworkDoneRequestSchema>

  response: {
    received: PronoteApiUserHomeworkDone["response"]
    session: SessionExported
  }

  params: {
    homework_id: string
  }

  path: ApiUserHomeworkDonePath
}
