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
