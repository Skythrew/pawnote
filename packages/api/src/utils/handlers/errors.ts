/**
 * All the `code`s that can be sent in an error response.
 * Messages for the client of all these errors should be done in the `i18n` sub-package.
 *
 * If you add an error code here, you should mention it
 * because `@pawnote/i18n` package needs to be updated to implement this error code !
 */
export enum ApiResponseErrorCode {
  /** When `req.body` doesn't validate with Zod. */
  InvalidRequestBody = "INVALID_REQUEST_BODY",

  RequestPayloadBroken = "REQUEST_PAYLOAD_BROKEN",
  ResponsePayloadBroken = 122,

  UserUnavailable = "USER_UNAVAILABLE",
  OngletUnauthorized = "ONGLET_UNAUTHORIZED",
  NotMatchingOrders = "NOT_MATCHING_ORDERS",

  UnknownServerSideError = "UNKNOWN_SERVER_SIDE_ERROR",
  NetworkFail = "NETWORK_FAIL",

  PronotePageDownload = "PRONOTE_PAGE_DOWNLOAD",

  RateLimit = "RATE_LIMITED",
  PronoteBannedIP = "PRONOTE_BANNED_IP",
  PronoteClosedInstance = "PRONOTE_CLOSED_INSTANCE",

  NoIVForAESCreated = "NO_IV_FOR_AES_CREATED",
  IncorrectCredentials = "INCORRECT_CREDENTIALS",

  SessionReadData = "SESSION_READ_DATA",
  SessionExpired = "SESSION_EXPIRED",

  ENTNotFound = "ENT_NOT_FOUND",
  ENTCookiesFetch = "ENT_COOKIES_FETCH",
  PronoteTicketFetch = "PRONOTE_TICKET_FETCH"
}

/**
 * Can be used anywhere, as long as we're in a handler, it will be automatically handled
 * by the `createApiHandlerFunction` function when thrown.
 */
export class HandlerResponseError extends Error {
  /** Code of the error to give more details on why an operation could've failed. */
  public code: ApiResponseErrorCode;
  /** HTTP status code. */
  public status: number;
  /** Optional debug informations that can be sent with the response to help debugging. */
  public debug?: unknown;

  constructor (code: ApiResponseErrorCode, options?: { debug?: unknown, status?: number }) {
    super(`ApiResponseErrorCode: ${code}`);
    this.name = "ResponseError";

    this.code = code;
    this.status = options?.status ?? 500;
    this.debug = options?.debug;
  }
}
