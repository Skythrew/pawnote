/** Pornote API error codes. Starting from 100. */
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