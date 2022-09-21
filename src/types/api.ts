/** Helper typing for error responsessl. */
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

export type ResponseDataGeolocation = {
  name: string;
  latitude: number;
  longitude: number;
}
