import type {
  PronoteApiInstance,
  PronoteApiAccountId,
  PronoteApiLoginInformations,
  PronoteApiLoginIdentify,
  PronoteApiLoginAuthenticate,
  PronoteApiUserData,
  PronoteApiUserTimetable
} from "@/types/pronote";

import type { SessionExported } from "@/types/session";

/** Helper type for error responses. */
export interface ResponseError {
  success: false;
  message: string;
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

export interface ApiLoginTicket {
  request: {
    ent_url: string;
    cookies: string[];
  }

  response: {
    /** URL with "identifiant" search parameter. */
    pronote_url: string;
  }

  path: "/login/ticket";
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
    cookies: string[];
  }

  path: "/login/authenticate";
}

export interface ApiUserData {
  request: {
    session: SessionExported;
    cookies?: string[];
  }

  response: {
    received: PronoteApiUserData["response"];
    session: SessionExported;
    cookies: string[];
  }

  path: "/user/data";
}

export interface ApiUserTimetable {
  request: {
    session: SessionExported;
    week_number: number;
    ressource: ApiUserData["response"]["received"]["donnees"]["ressource"];
  }

  response: {
    received: PronoteApiUserTimetable["response"];
    session: SessionExported;
  }

  path: "/user/timetable";
}
