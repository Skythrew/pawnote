import { ResponseErrorCode } from "@/types/api";

export const ERRORS = {
  [ResponseErrorCode.SessionExpired]: "The session was expired. Restore the session and try again.",
  [ResponseErrorCode.SessionCantRestore]: "Can't restore the session, please enter your credentials again.",
  [ResponseErrorCode.RequestPayloadBroken]: "A mistake was made in the request payload.",
  [ResponseErrorCode.UserUnavailable]: "User is not into the session.",
  [ResponseErrorCode.MissingParameters]: "Missing parameters in the body request.",
  [ResponseErrorCode.IncorrectParameters]: "Incorrect parameters in the URL or body.",
  [ResponseErrorCode.ServerSideError]: "Something went wrong when calling Pronote API.",
  [ResponseErrorCode.PronotePageDownload]: "Something went wrong when downloading the Pronote page.",
  [ResponseErrorCode.ENTAvailableCheck]: "Something went wrong when checking if ENT was available.",
  [ResponseErrorCode.PronoteBannedIP]:
  "Your IP address has been temporary banned.",
  [ResponseErrorCode.PronoteClosedInstance]:
  "This Pronote instance is closed.",
  [ResponseErrorCode.SessionReadData]:
  "Error while parsing session data.",
  [ResponseErrorCode.NetworkFail]: "A network error happened, please retry.",
  [ResponseErrorCode.NotMatchingOrders]:
  "Received and local orders aren't matching.",
  [ResponseErrorCode.NoIVForAESCreated]:
  "IV for the AES encryption wasn't created.",
  [ResponseErrorCode.NotFoundENT]:
"ENT not available. If you're a developer, please contribute to make a support for your ENT!",
  [ResponseErrorCode.PronoteTicketFetch]:
"Error while fetching the Pronote URL ticket. Please, try again.",
  [ResponseErrorCode.ENTCookiesFetch]:
"Error while fetching the ENT cookies. Maybe bad credentials, please try again.",
  [ResponseErrorCode.IncorrectCredentials]:
"Incorrect username and/or password.",
  [ResponseErrorCode.OngletUnauthorized]:
  "User is not authorized to access this onglet."
};