import type { PronoteApiAccountId, PronoteApiInstance } from "@/types/pronote";
import type { ApiInstance } from "@/types/api";

import { ResponseErrorCode } from "@/types/errors";

import { cleanPronoteUrl, objectHasProperty } from "@/utils/globals";
import { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";

import {
  handleServerRequest
} from "@/utils/server";

export const POST = handleServerRequest<ApiInstance>(async (req, res) => {
  if (!objectHasProperty(req.body, "pronote_url"))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: req.body }
    }, { status: 400 });

  try {
    const pronote_url = cleanPronoteUrl(req.body.pronote_url);

    // Get mobile informations about the Pronote instance.
    const response = await fetch(pronote_url + "/infoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4", {
      method: "GET",
      headers: { "User-Agent": req.user_agent }
    });

    const data = await response.json() as PronoteApiInstance["response"];

    const accounts = data.espaces.map((account) => ({
      name: account.nom.replace("Espace", "").trim(),
      id: parseInt(Object.entries(PRONOTE_ACCOUNT_TYPES).find(
        ([, val]) => val.path === account.URL.replace("mobile.", "")
      )?.[0] as unknown as string) as PronoteApiAccountId
    }));

    return res.success({
      accounts,
      pronote_url,
      school_name: data.nomEtab,
      ent_url: data.CAS.actif ? data.CAS.casURL : undefined
    });
  }
  catch (error) {
    console.error("[/api/instance]", error);
    return res.error({
      code: ResponseErrorCode.ServerSideError,
      debug: { trace: error }
    });
  }
});

