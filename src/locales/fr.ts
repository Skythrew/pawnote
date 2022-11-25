import type { Language } from ".";

import { ResponseErrorCode, ClientErrorCode } from "@/types/errors";
import { AppStateCode } from "@/stores/app";

export const API_ERRORS: Language["API_ERRORS"] = {
  [ResponseErrorCode.SessionExpired]: "La session a expiré.",
  [ResponseErrorCode.RequestPayloadBroken]: "Une erreur a été produite dans le payload de la requête.",
  [ResponseErrorCode.UserUnavailable]: "L'utilisateur n'est pas dans la session.",
  [ResponseErrorCode.MissingParameters]: "Paramètres manquants dans le corps de la requête.",
  [ResponseErrorCode.IncorrectParameters]: "Paramètres incorrects dans l'URL ou le corps de la requête.",
  [ResponseErrorCode.ServerSideError]: "Une erreur est survenue lors de l'appel a l'API de Pronote.",
  [ResponseErrorCode.PronotePageDownload]: "Something went wrong when downloading the Pronote page.",
  [ResponseErrorCode.ENTAvailableCheck]: "Something went wrong when checking if ENT was available.",
  [ResponseErrorCode.PronoteBannedIP]: "Cette adresse IP a ete temporairement suspendue.",
  [ResponseErrorCode.PronoteClosedInstance]: "Cette instance Pronote est ferme.",
  [ResponseErrorCode.SessionReadData]: "Une erreur est survenue lors du parsing des données de session.",
  [ResponseErrorCode.NetworkFail]: "Une erreur reseau est survenue.",
  [ResponseErrorCode.NotMatchingOrders]: "L'ordre local et l'ordre recu ne sont pas egaux.",
  [ResponseErrorCode.NoIVForAESCreated]: "L'IV pour l'encryption AES n'a pas ete cree.",
  [ResponseErrorCode.NotFoundENT]: "ENT actuellement non disponible.",
  [ResponseErrorCode.PronoteTicketFetch]: "Error while fetching the Pronote URL ticket. Please, try again.",
  [ResponseErrorCode.ENTCookiesFetch]: "Error while fetching the ENT cookies. Maybe bad credentials, please try again.",
  [ResponseErrorCode.IncorrectCredentials]: "Nom d'utilisateur ou mot de passe incorrect.",
  [ResponseErrorCode.OngletUnauthorized]: "Votre compte n'est pas autorise a acceder cet onglet."
};

export const CLIENT_ERRORS: Language["CLIENT_ERRORS"] = {
  [ClientErrorCode.SessionCantRestore]: "Session non recuperable, entrez a nouveau vos identifants.",
  [ClientErrorCode.NetworkFail]: "Une erreur reseau est survenue."
};

export const APP_STATE: Language["APP_STATE"] = {
  [AppStateCode.FetchingGrades]: "Actualisation des notes",
  [AppStateCode.FetchingHomeworks]: "Actualisation des devoirs",
  [AppStateCode.FetchingRessources]: "Actualisation des ressources pédagogiques",
  [AppStateCode.FetchingTimetable]: "Actualisation de l'emploi du temps"
};

export const PAGES: Language["PAGES"] = {
  INDEX: {
    dark: "Sombre",
    light: "Clair",
    description: "Client non-officiel pour Pronote.",
    link_account: "Associer un compte Pronote !",
    link_new_account: "Associer un autre compte Pronote",
    loading_accounts: "Chargement des comptes..."
  }
};

export default {
  API_ERRORS,
  CLIENT_ERRORS,
  APP_STATE,
  PAGES
} as Language;

