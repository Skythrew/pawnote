import type { PronoteApiInstance, ApiInstance } from "./types";
import type { PronoteAccountType } from "@/utils/globals";

import { PRONOTE_ACCOUNT_TYPES } from "@/utils/globals";
import { cleanPronoteUrl } from "@/utils/globals";

import { createApiFunction } from "@/utils/globals";
import { ResponseErrorCode } from "@/types/errors";

const is_account = (item: PronoteAccountType | undefined): item is PronoteAccountType => {
  return !!item;
}

export const instance = createApiFunction<ApiInstance>(async (req, res) => {
  try {
    const pronote_url = cleanPronoteUrl(req.body.pronote_url);
    const informations_url = `${pronote_url}/infoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4`;
  
    const response = await req.fetch(informations_url, {
      method: "GET"
    }) as PronoteApiInstance["response"];
  
    const accounts = response.espaces.map(
      account => PRONOTE_ACCOUNT_TYPES.find(
        account_type => account_type.path === account.URL.replace("mobile.", "")
      )
    ).filter(is_account);
  
    return res.success({
      accounts,
      pronote_url,
      school_name: response.nomEtab,
      ent_url: response.CAS.actif ? response.CAS.casURL : undefined
    });
  }
  catch (error) {
    return res.error({
      code: ResponseErrorCode.ServerSideError
    });
  }
});
