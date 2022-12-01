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
  [ResponseErrorCode.PronotePageDownload]: "Une erreur s'est produite lors du téléchargement de la page Pronote.",
  [ResponseErrorCode.ENTAvailableCheck]: "Une erreur s'est produite lors de la vérification d'existance ENT.",
  [ResponseErrorCode.PronoteBannedIP]: "Cette adresse IP a ete temporairement suspendue.",
  [ResponseErrorCode.PronoteClosedInstance]: "Cette instance Pronote est ferme.",
  [ResponseErrorCode.SessionReadData]: "Une erreur est survenue lors du parsing des données de session.",
  [ResponseErrorCode.NetworkFail]: "Une erreur réseau est survenue.",
  [ResponseErrorCode.NotMatchingOrders]: "L'ordre local et l'ordre reçu ne sont pas égaux.",
  [ResponseErrorCode.NoIVForAESCreated]: "L'IV pour l'encryption AES n'a pas été crée.",
  [ResponseErrorCode.NotFoundENT]: "ENT actuellement non supporté par Pornote.",
  [ResponseErrorCode.PronoteTicketFetch]: "Erreur lors de la récupération du ticket URL de Pronote, veuillez réessayer.",
  [ResponseErrorCode.ENTCookiesFetch]: "Erreur lors de la récupération des cookies ENT cookies. Celà peut être dû à de mauvais identifiants, réessayez.",
  [ResponseErrorCode.IncorrectCredentials]: "Nom d'utilisateur ou mot de passe incorrect.",
  [ResponseErrorCode.OngletUnauthorized]: "Votre compte n'est pas autorisé à accéder à cet onglet."
};

export const CLIENT_ERRORS: Language["CLIENT_ERRORS"] = {
  [ClientErrorCode.SessionCantRestore]: "Session non récupérable, entrez à nouveau vos identifants.",
  [ClientErrorCode.NetworkFail]: "Une erreur réseau est survenue."
};

export const APP_STATE: Language["APP_STATE"] = {
  [AppStateCode.FetchingGrades]: "Actualisation des notes",
  [AppStateCode.FetchingHomeworks]: "Actualisation des devoirs",
  [AppStateCode.FetchingRessources]: "Actualisation des ressources pédagogiques",
  [AppStateCode.FetchingTimetable]: "Actualisation de l'emploi du temps",
  [AppStateCode.ChangingHomeworkState]: "Mise à jour d'un devoir"
};

export const PAGES: Language["PAGES"] = {
  _: {
    LOADING: "Chargement de Pornote...",
    ERROR: "Une erreur critique est survenue !",
    RESTART: "Redémarrer"
  },

  INDEX: {
    DESCRIPTION: "Client non-officiel pour Pronote.",
    LINK_FIRST: "Associer un compte Pronote !",
    LINK_ANOTHER: "Associer un autre compte Pronote",
    LOADING: "Chargement des comptes..."
  },

  APP: {
    _: {
      FETCHING: "Récupération des données",
      WAIT: "Veuillez patienter..."
    }
  }
};

export default {
  API_ERRORS,
  CLIENT_ERRORS,
  APP_STATE,
  PAGES
} as Language;

