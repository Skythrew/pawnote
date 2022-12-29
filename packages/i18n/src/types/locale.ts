import type { ClientAppStateCode, ClientErrorCode } from "./client";
import type { ResponseErrorCode } from "@pornote/api";

export interface Language {
  API_ERRORS: Record<ResponseErrorCode, string>;
  CLIENT_ERRORS: Record<ClientErrorCode, string>;
  APP_STATE: Omit<Record<ClientAppStateCode, string>, ClientAppStateCode.Idle>;
  PAGES: {
    /** Corresponds to `@/root.tsx` */
    _: Record<
      | "LOADING"
      | "ERROR"
      | "RESTART"
    , string>

    /** Corresponds to `@/routes/index.tsx` */
    INDEX: Record<
      | "DESCRIPTION"
      | "LINK_FIRST"
      | "LINK_ANOTHER"
      | "LOADING"
    , string>

    APP: {
      /** Corresponds to `@/routes/app/[slug].tsx` */
      _: Record<
        | "FETCHING"
        | "WAIT"
      , string>
    }
  }
}
