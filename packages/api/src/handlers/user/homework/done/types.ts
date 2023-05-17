import { PronoteApiOnglets, PronoteApiFunctions } from "@/types/pronote_api";
import type { SessionExported } from "@/utils/session";

export interface PronoteApiUserHomeworkDone {
  request: {
		_Signature_: {
			onglet: PronoteApiOnglets.Homeworks;
		}

    donnees: {
      listeTAF: {
        /** ID of the homework. */
        N: string;
        E: 2; // Why 2 ? I don't even know.
        /** Homework has been done or not. */
        TAFFait: boolean;
      }[];
    }
  }

  response: {
    nom: PronoteApiFunctions.HomeworkDone;
    RapportSaisie: Record<string, never>;
    donnees: Record<string, never>;
  }
}

type ApiUserHomeworkDonePath = `/user/homework/${string}/done`;
export interface ApiUserHomeworkDone {
  request: {
    session: SessionExported;
    done: boolean;
  }

  response: {
    received: PronoteApiUserHomeworkDone["response"];
    session: SessionExported;
  }

  path: ApiUserHomeworkDonePath;
}
