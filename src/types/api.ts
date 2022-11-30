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

type ApiUserHomeworkDonePath = `/user/homework/${string}/done`;
export interface ApiUserHomeworkDone {
  request: {
    session: SessionExported;
    /** Not required, should default to `true`. */
    done?: boolean;
  }

  response: {
    received: PronoteApiUserHomeworkDone["response"];
    session: SessionExported;
  }

  path: ApiUserHomeworkDonePath;
}

