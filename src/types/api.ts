import type {
  PronoteApiInstance,
  PronoteApiAccountId,
  PronoteApiLoginInformations
} from "@/types/pronote";
import {SessionExported} from "./session";

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

  path: "/geolocation"
}

export interface ApiInstance {
  request: {
    pronote_url: string
  }

  response: {
    received: PronoteApiInstance["response"];
    pronote_url: string;
    ent_url?: string;
  }

  path: "/instance"
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

    /** Add cookies to the request. */
    cookies?: string[];
	}

	response: {
		received: PronoteApiLoginInformations["response"];
		session: SessionExported;
    pronote_url: string;
	},

  path: "/login/informations"
}
