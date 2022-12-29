import type { Language } from "@/types/locale";
import { ResponseErrorCode } from "@pornote/api";
import { ClientAppStateCode, ClientErrorCode } from "@/types/client";

const API_ERRORS: Language["API_ERRORS"] = {
  [ResponseErrorCode.SessionExpired]: "The session was expired. Restore the session and try again.",
  [ResponseErrorCode.RequestPayloadBroken]: "A mistake was made in the request payload.",
  [ResponseErrorCode.UserUnavailable]: "User is not into the session.",
  [ResponseErrorCode.MissingParameters]: "Missing parameters in the body request.",
  [ResponseErrorCode.IncorrectParameters]: "Incorrect parameters in the URL or body.",
  [ResponseErrorCode.ServerSideError]: "Something went wrong when calling Pronote API.",
  [ResponseErrorCode.PronotePageDownload]: "Something went wrong when downloading the Pronote page.",
  [ResponseErrorCode.ENTAvailableCheck]: "Something went wrong when checking if ENT was available.",
  [ResponseErrorCode.PronoteBannedIP]: "Your IP address has been temporary banned by Pronote, retry later.",
  [ResponseErrorCode.PronoteClosedInstance]: "This Pronote instance is closed.",
  [ResponseErrorCode.SessionReadData]: "Error while parsing session data.",
  [ResponseErrorCode.NetworkFail]: "A network error happened, please retry.",
  [ResponseErrorCode.NotMatchingOrders]: "Received and local orders aren't matching.",
  [ResponseErrorCode.NoIVForAESCreated]: "IV for the AES encryption wasn't created.",
  [ResponseErrorCode.NotFoundENT]: "ENT not available. If you're a developer, please contribute to make a support for your ENT!",
  [ResponseErrorCode.PronoteTicketFetch]: "Error while fetching the Pronote URL ticket. Please, try again.",
  [ResponseErrorCode.ENTCookiesFetch]: "Error while fetching the ENT cookies. Maybe bad credentials, please try again.",
  [ResponseErrorCode.IncorrectCredentials]: "Incorrect username and/or password.",
  [ResponseErrorCode.OngletUnauthorized]: "User is not authorized to access this onglet.",
  [ResponseErrorCode.RateLimit]: "You do too many requests per second, please slow down.",
  [ResponseErrorCode.ResponsePayloadBroken]: "Error was made in the response payload, please retry."
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
    LOADING: "Loading Pornote...",
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
      FETCHING: "Retreiving local data",
      WAIT: "Please wait..."
    }
  }
};

export default {
  PAGES,
  APP_STATE,
  API_ERRORS,
  CLIENT_ERRORS
} as Language;
