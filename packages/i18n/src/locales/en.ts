import type { Language } from "@/types/locale";
import { ApiResponseErrorCode } from "@pawnote/api";
import { ClientAppStateCode, ClientErrorCode } from "@/types/client";

const API_ERRORS: Language["API_ERRORS"] = {
  [ApiResponseErrorCode.SessionExpired]: "The session was expired. Restore the session and try again.",
  [ApiResponseErrorCode.RequestPayloadBroken]: "A mistake was made in the request payload.",
  [ApiResponseErrorCode.UserUnavailable]: "User is not into the session.",
  [ApiResponseErrorCode.InvalidRequestBody]: "Incorrect parameters in the URL or body.",
  [ApiResponseErrorCode.UnknownServerSideError]: "Something went wrong when calling Pronote API.",
  [ApiResponseErrorCode.PronotePageDownload]: "Something went wrong when downloading the Pronote page.",
  [ApiResponseErrorCode.PronoteBannedIP]: "Your IP address has been temporary banned by Pronote, retry later.",
  [ApiResponseErrorCode.PronoteClosedInstance]: "This Pronote instance is closed.",
  [ApiResponseErrorCode.SessionReadData]: "Error while parsing session data.",
  [ApiResponseErrorCode.NetworkFail]: "A network error happened, please retry.",
  [ApiResponseErrorCode.NotMatchingOrders]: "Received and local orders aren't matching.",
  [ApiResponseErrorCode.NoIVForAESCreated]: "IV for the AES encryption wasn't created.",
  [ApiResponseErrorCode.ENTNotFound]: "ENT not available. If you're a developer, please contribute to make a support for your ENT!",
  [ApiResponseErrorCode.PronoteTicketFetch]: "Error while fetching the Pronote URL ticket. Please, try again.",
  [ApiResponseErrorCode.ENTCookiesFetch]: "Error while fetching the ENT cookies. Maybe bad credentials, please try again.",
  [ApiResponseErrorCode.IncorrectCredentials]: "Incorrect username and/or password.",
  [ApiResponseErrorCode.OngletUnauthorized]: "User is not authorized to access this onglet.",
  [ApiResponseErrorCode.RateLimit]: "You do too many requests per second, please slow down.",
  [ApiResponseErrorCode.ResponsePayloadBroken]: "Error was made in the response payload, please retry."
};

const CLIENT_ERRORS: Language["CLIENT_ERRORS"] = {
  [ClientErrorCode.SessionCantRestore]: "Can't restore the session, please enter your credentials again.",
  [ClientErrorCode.NetworkFail]: "A network error happened, please retry.",
  [ClientErrorCode.Offline]: "You can't do this action because you're offline."
};

const APP_STATE: Language["APP_STATE"] = {
  [ClientAppStateCode.FetchingGrades]: "Refreshing grades",
  [ClientAppStateCode.FetchingHomeworks]: "Refreshing homeworks",
  [ClientAppStateCode.FetchingRessources]: "Refreshing ressources",
  [ClientAppStateCode.FetchingTimetable]: "Refreshing timetable",
  [ClientAppStateCode.UpdatingHomeworkState]: "Updating an homework"
};

const PAGES: Language["PAGES"] = {
  _: {
    LOADING: "Loading Pawnote...",
    ERROR: "Critical error happened !",
    RESTART: "Restart"
  },

  INDEX: {
    DESCRIPTION: "Unofficial client for Pronote.",
    LINK_FIRST: "Link a Pronote account !",
    LINK_ANOTHER: "Link another Pronote account",
    LOADING: "Loading accounts..."
  },

  APP: {
    _: {
      FETCHING: "Retrieving local data",
      WAIT: "Please wait..."
    }
  }
};

export default {
  PAGES,
  APP_STATE,
  API_ERRORS,
  CLIENT_ERRORS
} satisfies Language;
