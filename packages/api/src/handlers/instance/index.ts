import type { PronoteApiInstance, ApiInstance } from "./types";
import type { PronoteApiAccountType } from "@/types/pronote_api";
import { ResponseErrorCode } from "@/types/internals";

import { createApiFunction, cleanPronoteUrl } from "@/utils/globals";
import { PRONOTE_ACCOUNT_TYPES, PRONOTE_INSTANCE_MOBILE_INFOS_PATH } from "@/utils/constants";

const isPronoteApiAccountType = (item: PronoteApiAccountType | undefined): item is PronoteApiAccountType => {
  return !!item;
};

export default createApiFunction<ApiInstance>(async (req, res) => {
  try {
    const pronote_url = cleanPronoteUrl(req.body.pronote_url);
    const informations_url = `${pronote_url}/${PRONOTE_INSTANCE_MOBILE_INFOS_PATH}`;

    const response = await req.fetch(informations_url, {
      method: "GET"
    });

    const data = await response.json<PronoteApiInstance["response"]>();

    const accounts = data.espaces.map(
      account => PRONOTE_ACCOUNT_TYPES.find(
        account_type => account_type.path === account.URL.replace("mobile.", "")
      )
    ).filter(isPronoteApiAccountType);

    return res.success({
      accounts,
      pronote_url,
      school_name: data.nomEtab,
      ent_url: data.CAS.actif ? data.CAS.casURL : undefined
    });
  }
  catch (error) {
    return res.error({
      code: ResponseErrorCode.ServerSideError
    });
  }
});
