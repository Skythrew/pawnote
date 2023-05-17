/** `fetcher` call that is needed by every handlers. */
export type HttpCallFunction = (url: string, options: {
  method: "GET" | "POST";
  /** Headers that should be appended to the request. */
  headers?: Record<string, string> | Headers;
  /** Body of the request of type given in the "Content-Type" header. */
  body?: unknown;
}) => Promise<{
  headers: Record<string, string> | Headers;
  text: () => Promise<string>;
  json: <T>() => Promise<T>;
}>;

export interface ResponseError {
  success: false;
  code: ResponseErrorCode;
  debug?: unknown;
}

export interface ResponseSuccess<T> {
  success: true;
  data: T;
}

export type Response<T> = ResponseSuccess<T> | ResponseError;

export enum ResponseErrorCode {
  RequestPayloadBroken = 101,
  UserUnavailable = 102,
  MissingParameters = 103,
  IncorrectParameters = 104,
  ServerSideError = 105,
  PronotePageDownload = 106,
  ENTAvailableCheck = 107,
  PronoteBannedIP = 108,
  PronoteClosedInstance = 109,
  SessionReadData = 110,
  NetworkFail = 111,
  NoIVForAESCreated = 113,
  NotFoundENT = 114,
  PronoteTicketFetch = 115,
  ENTCookiesFetch = 116,
  IncorrectCredentials = 117,
  OngletUnauthorized = 118,
  NotMatchingOrders = 119,
  SessionExpired = 120,
  RateLimit = 121,
  ResponsePayloadBroken = 122
}
