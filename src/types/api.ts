/** Helper typing for error responses. */
export interface ResponseError {
  success: false;
  message: string;
  debug?: unknown;
}

/** Helper typing for successful responses. */
export interface ResponseSuccess<T> {
  success: true;
  data: T;
}

/** Helper type. */
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
