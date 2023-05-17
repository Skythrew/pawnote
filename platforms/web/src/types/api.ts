import type {
  PronoteApiAccountId,
  PronoteApiLoginInformations,
  PronoteApiLoginIdentify,
  PronoteApiLoginAuthenticate,
  PronoteApiUserData,
  PronoteApiUserTimetable,
  PronoteApiUserHomeworks,
  PronoteApiUserRessources,
  PronoteApiUserGrades,
  PronoteApiUserHomeworkDone
} from "@/types/pronote";

import type { SessionExported } from "@/types/session";
import type { ResponseErrorCode } from "@/types/errors";

/** Helper type for error responses. */
export interface ResponseError {
  success: false;
  code: ResponseErrorCode;
  debug?: unknown;
}

/** Helper type for successful responses. */
export interface ResponseSuccess<T> {
  success: true;
  data: T;
}

/** Helper type that includes success and error */
export type Response<T> = ResponseSuccess<T> | ResponseError;

export interface ApiLoginEntCookies {
  request: {
    ent_url: string;
    credentials: string;
  }

  response: {
    ent_cookies: string[];
  }

  path: "/login/ent_cookies";
}

export interface ApiLoginEntTicket {
  request: {
    ent_url: string;
    pronote_url: string;
    ent_cookies: string[];
  }

  response: {
    /** New URL with "?identifiant=XXXX" parameter. */
    pronote_url: string;
  }

  path: "/login/ent_ticket";
}

export interface ApiLoginInformations {
	request: {
    account_type: PronoteApiAccountId;
		pronote_url: string;

    /**
      * Tells the server to not clean the Pronote URL.
      * Defaults to `false`.
      */
    raw_url?: boolean;

    /**
     * Cookies used when downloading the Pronote page.
     * Required when creating a new session from ENT or an already set-up session.
     *
     * This will append `e` and `f` in to the `setup` object.
     */
    cookies?: string[];
	}

	response: {
		received: PronoteApiLoginInformations["response"];
		session: SessionExported;
    cookies: string[];

    setup?: {
      username: string;
      password: string;
    }
	}

  path: "/login/informations";
}

export interface ApiLoginIdentify {
  request: {
    pronote_username: string;

    session: SessionExported;
    cookies?: string[];
  }

  response: {
    received: PronoteApiLoginIdentify["response"];
    session: SessionExported;
  }

  path: "/login/identify";
}

export interface ApiLoginAuthenticate {
  request: {
    /** Challenge from `ApiLoginIdentify["response"]` solved. */
    solved_challenge: string;

    session: SessionExported;
    cookies?: string[];
  }

  response: {
    received: PronoteApiLoginAuthenticate["response"];
    session: SessionExported;
  }

  path: "/login/authenticate";
}
