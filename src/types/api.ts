import type {
  PronoteApiInstance,
  PronoteApiAccountId
} from "@/types/pronote";

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
}

export interface ApiInstance {
  request: {
    pronote_url: string;
  }

  response: {
    received: PronoteApiInstance["response"][PronoteApiAccountId.Commun];
    pronote_url: string;
    ent_url?: string;
  }
}
