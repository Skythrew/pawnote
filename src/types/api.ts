import type {
  PronoteApiInstance,
  PronoteApiAccountId,
  PronoteApiLoginInformations,
  PronoteApiLoginIdentify,
  PronoteApiLoginAuthenticate,
  PronoteApiUserData,
  PronoteApiUserTimetable,
  PronoteApiUserHomeworks,
  PronoteApiUserRessources,
  PronoteApiUserGrades
} from "@/types/pronote";

import type { SessionExported } from "@/types/session";

export enum ResponseErrorMessage {
  SessionExpired = "The session was expired. Restore the session and try again.",
  SessionCantRestore = "Can't restore the session, please enter your credentials again.",
  RequestPayloadBroken = "A mistake was made in the request payload.",
  UserUnavailable = "User is not into the session.",
  MissingParameters = "Missing parameters in the body request.",
  IncorrectParameters = "Incorrect parameters in the URL or body.",
  ServerSideError = "Something went wrong when calling Pronote API.",
  PronotePageDownload = "Something went wrong when downloading the Pronote page.",
  ENTAvailableCheck = "Something went wrong when checking if ENT was available.",
  PronoteBannedIP = "Your IP address has been temporary banned.",
  PronoteClosedInstance = "This Pronote instance is closed.",
  SessionReadData = "Error while parsing session data.",
  NetworkFail = "A network error happened, please retry.",
  NotMatchingOrders = "Received and local orders aren't matching.",
  NoIVForAESCreated = "IV for the AES encryption wasn't created.",
  NotFoundENT = "ENT not available. If you're a developer, please contribute to make a support for your ENT!",
  PronoteTicketFetch = "Error while fetching the Pronote URL ticket. Please, try again.",
  ENTCookiesFetch = "Error while fetching the ENT cookies. Maybe bad credentials, please try again.",
  IncorrectCredentials = "Incorrect username and/or password.",
  OngletUnauthorized = "User is not authorized to access this onglet."
}

/** Helper type for error responses. */
export interface ResponseError {
  success: false;
  message: ResponseErrorMessage;
  debug?: unknown;
}

/** Helper type for successful responses. */
export interface ResponseSuccess<T> {
  success: true;
  data: T;
}

/** Helper type that includes success and error */
export type Response<T> = ResponseSuccess<T> | ResponseError;

export interface ApiGeolocation {
  request: {
    latitude: number;
    longitude: number;
  }

  response: {
    url: string;
    name: string;
    latitude: number;
    longitude: number;
    postal_code: number;
    /** Distance in meters. */
    distance: number;
  }[]

  path: "/geolocation";
}

export interface ApiInstance {
  request: {
    pronote_url: string;
  }

  response: {
    received: PronoteApiInstance["response"];
    pronote_url: string;
    ent_url?: string;
  }

  path: "/instance";
}

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
    ent_cookies: string[];
  }

  response: {
    /** URL with "identifiant" search parameter. */
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

export interface ApiUserData {
  request: {
    session: SessionExported;
  }

  response: {
    received: PronoteApiUserData["response"];
    session: SessionExported;
  }

  path: "/user/data";
}

type ApiUserTimetablePath = `/user/timetable/${number}`;
export interface ApiUserTimetable {
  request: {
    session: SessionExported;
    ressource: ApiUserData["response"]["received"]["donnees"]["ressource"];
  }

  response: {
    received: PronoteApiUserTimetable["response"];
    session: SessionExported;
  }

  path: ApiUserTimetablePath;
}

type ApiUserHomeworksPath = `/user/homeworks/${number}`;
export interface ApiUserHomeworks {
  request: {
    session: SessionExported;
  }

  response: {
    received: PronoteApiUserHomeworks["response"];
    session: SessionExported;
  }

  path: ApiUserHomeworksPath;
}


type ApiUserRessourcesPath = `/user/ressources/${number}`;
export interface ApiUserRessources {
  request: {
    session: SessionExported;
  }

  response: {
    received: PronoteApiUserRessources["response"];
    session: SessionExported;
  }

  path: ApiUserRessourcesPath;
}

type ApiUserGradesPath = `/user/grades/${string}`;
export interface ApiUserGrades {
  request: {
    session: SessionExported;
    period: PronoteApiUserGrades["request"]["donnees"]["Periode"];
  }

  response: {
    received: PronoteApiUserGrades["response"];
    session: SessionExported;
  }

  path: ApiUserGradesPath;
}
