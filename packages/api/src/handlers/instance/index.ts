import type { PronoteApiInstance, ApiInstance } from "./types";
import { ApiInstanceRequestSchema } from "./types";

import { cleanPronoteUrl, type PronoteApiAccountType } from "@/utils/requests/pronote";
import { createApiFunction } from "@/utils/handlers/create";
import { PRONOTE_ACCOUNT_TYPES, PRONOTE_INSTANCE_MOBILE_INFOS_PATH } from "@/utils/constants";

/**
 * Filter function to prevent TS issues.
 * Allows to check that every item is defined and make them typed to `PronoteApiAccountType`.
 */
const isPronoteApiAccountType = (item: PronoteApiAccountType | undefined): item is PronoteApiAccountType => {
  return !(item === null);
};

/**
 * Takes an instance URL and return informations about it such as...
 * - available account types ;
 * - instance name ;
 * - base URL and potential ENT URL
 */
export default createApiFunction<ApiInstance>(ApiInstanceRequestSchema, async (req, res) => {
  const pronote_url = cleanPronoteUrl(req.body.pronote_url);
  const informations_url = `${pronote_url}/${PRONOTE_INSTANCE_MOBILE_INFOS_PATH}`;

  const response = await req.fetch(informations_url, {
    method: "GET"
  });

  const data = await response.json<PronoteApiInstance["response"]>();

  const accounts = data.espaces.map(account => PRONOTE_ACCOUNT_TYPES.find(
    // We replace every paths from mobile version to desktop version by removing `mobile.` in paths.
    account_type => account_type.path === account.URL.replace("mobile.", "")
  )).filter(isPronoteApiAccountType);

  return res.success({
    accounts,
    pronote_url,
    school_name: data.nomEtab,
    ent_url: data.CAS.actif ? data.CAS.casURL : undefined
  });
});
