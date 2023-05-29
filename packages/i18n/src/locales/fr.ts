import type { Language } from "@/types/locale";
import { ApiResponseErrorCode } from "@pawnote/api";
import { ClientAppStateCode, ClientErrorCode } from "@/types/client";

const API_ERRORS: Language["API_ERRORS"] = {
  [ApiResponseErrorCode.SessionExpired]: "La session a expiré.",
  [ApiResponseErrorCode.RequestPayloadBroken]: "Une erreur a été produite dans le payload de la requête.",
  [ApiResponseErrorCode.UserUnavailable]: "L'utilisateur n'est pas dans la session.",
  [ApiResponseErrorCode.InvalidRequestBody]: "Paramètres incorrects dans l'URL ou le corps de la requête.",
  [ApiResponseErrorCode.UnknownServerSideError]: "Une erreur est survenue lors de l'appel a l'API de Pronote.",
  [ApiResponseErrorCode.PronotePageDownload]: "Une erreur s'est produite lors du téléchargement de la page Pronote.",
  [ApiResponseErrorCode.PronoteBannedIP]: "Votre adresse IP a été temporairement suspendue par Pronote, réessayez plus tard.",
  [ApiResponseErrorCode.PronoteClosedInstance]: "Cette instance Pronote est ferme.",
  [ApiResponseErrorCode.SessionReadData]: "Une erreur est survenue lors du parsing des données de session.",
  [ApiResponseErrorCode.NetworkFail]: "Une erreur réseau est survenue.",
  [ApiResponseErrorCode.NotMatchingOrders]: "L'ordre local et l'ordre reçu ne sont pas égaux.",
  [ApiResponseErrorCode.NoIVForAESCreated]: "L'IV pour l'encryption AES n'a pas été crée.",
  [ApiResponseErrorCode.ENTNotFound]: "ENT actuellement non supporté par Pawnote.",
  [ApiResponseErrorCode.PronoteTicketFetch]: "Erreur lors de la récupération du ticket URL de Pronote, veuillez réessayer.",
  [ApiResponseErrorCode.ENTCookiesFetch]: "Erreur lors de la récupération des cookies ENT cookies. Cela peut être dû à de mauvais identifiants, réessayez.",
  [ApiResponseErrorCode.IncorrectCredentials]: "Nom d'utilisateur ou mot de passe incorrect.",
  [ApiResponseErrorCode.OngletUnauthorized]: "Votre compte n'est pas autorisé à accéder à cet onglet.",
  [ApiResponseErrorCode.RateLimit]: "Vous effectuez trop de requêtes par secondes, veuillez ralentir.",
  [ApiResponseErrorCode.ResponsePayloadBroken]: "Une erreur a été produite dans le payload de la réponse."
};

const CLIENT_ERRORS: Language["CLIENT_ERRORS"] = {
  [ClientErrorCode.SessionCantRestore]: "Session non récupérable, entrez à nouveau vos identifiants.",
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
    LOADING: "Chargement de Pawnote...",
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
} satisfies Language;
