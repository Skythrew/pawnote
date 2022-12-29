import type { Language } from "@/types/locale";
import { ResponseErrorCode } from "@pornote/api";
import { ClientAppStateCode, ClientErrorCode } from "@/types/client";

const API_ERRORS: Language["API_ERRORS"] = {
  [ResponseErrorCode.SessionExpired]: "La session a expiré.",
  [ResponseErrorCode.RequestPayloadBroken]: "Une erreur a été produite dans le payload de la requête.",
  [ResponseErrorCode.UserUnavailable]: "L'utilisateur n'est pas dans la session.",
  [ResponseErrorCode.MissingParameters]: "Paramètres manquants dans le corps de la requête.",
  [ResponseErrorCode.IncorrectParameters]: "Paramètres incorrects dans l'URL ou le corps de la requête.",
  [ResponseErrorCode.ServerSideError]: "Une erreur est survenue lors de l'appel a l'API de Pronote.",
  [ResponseErrorCode.PronotePageDownload]: "Une erreur s'est produite lors du téléchargement de la page Pronote.",
  [ResponseErrorCode.ENTAvailableCheck]: "Une erreur s'est produite lors de la vérification d'existance ENT.",
  [ResponseErrorCode.PronoteBannedIP]: "Votre adresse IP a été temporairement suspendue par Pronote, réessayez plus tard.",
  [ResponseErrorCode.PronoteClosedInstance]: "Cette instance Pronote est ferme.",
  [ResponseErrorCode.SessionReadData]: "Une erreur est survenue lors du parsing des données de session.",
  [ResponseErrorCode.NetworkFail]: "Une erreur réseau est survenue.",
  [ResponseErrorCode.NotMatchingOrders]: "L'ordre local et l'ordre reçu ne sont pas égaux.",
  [ResponseErrorCode.NoIVForAESCreated]: "L'IV pour l'encryption AES n'a pas été crée.",
  [ResponseErrorCode.NotFoundENT]: "ENT actuellement non supporté par Pornote.",
  [ResponseErrorCode.PronoteTicketFetch]: "Erreur lors de la récupération du ticket URL de Pronote, veuillez réessayer.",
  [ResponseErrorCode.ENTCookiesFetch]: "Erreur lors de la récupération des cookies ENT cookies. Celà peut être dû à de mauvais identifiants, réessayez.",
  [ResponseErrorCode.IncorrectCredentials]: "Nom d'utilisateur ou mot de passe incorrect.",
  [ResponseErrorCode.OngletUnauthorized]: "Votre compte n'est pas autorisé à accéder à cet onglet.",
  [ResponseErrorCode.RateLimit]: "Vous effectuez trop de requêtes par secondes, veuillez ralentir.",
  [ResponseErrorCode.ResponsePayloadBroken]: "Une erreur a été produite dans le payload de la réponse."
};

const CLIENT_ERRORS: Language["CLIENT_ERRORS"] = {
  [ClientErrorCode.SessionCantRestore]: "Session non récupérable, entrez à nouveau vos identifants.",
  [ClientErrorCode.NetworkFail]: "Une erreur réseau est survenue.",
  [ClientErrorCode.Offline]: "Vous ne pouvez pas effectuer cette action car vous êtes hors-ligne."
};

const APP_STATE: Language["APP_STATE"] = {
  [ClientAppStateCode.FetchingGrades]: "Actualisation des notes",
  [ClientAppStateCode.FetchingHomeworks]: "Actualisation des devoirs",
  [ClientAppStateCode.FetchingRessources]: "Actualisation des ressources pédagogiques",
  [ClientAppStateCode.FetchingTimetable]: "Actualisation de l'emploi du temps",
  [ClientAppStateCode.UpdatingHomeworkState]: "Mise à jour d'un devoir"
};

const PAGES: Language["PAGES"] = {
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

