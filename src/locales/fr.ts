import { ResponseErrorCode, ClientErrorCode } from "@/types/errors";

export const API_ERRORS = {
  [ResponseErrorCode.SessionExpired]: "La session a expire.",
  [ResponseErrorCode.RequestPayloadBroken]: "Une erreur a ete produite dans le payload de la requete.",
  [ResponseErrorCode.UserUnavailable]: "L'utilisateur n'est pas dans la session.",
  [ResponseErrorCode.MissingParameters]: "Missing parameters in the body request.",
  [ResponseErrorCode.IncorrectParameters]: "Parametres incorrects dans l'URL ou le corps de la requete.",
  [ResponseErrorCode.ServerSideError]: "Une erreur est survenue lors de l'appel a l'API de Pronote.",
  [ResponseErrorCode.PronotePageDownload]: "Something went wrong when downloading the Pronote page.",
  [ResponseErrorCode.ENTAvailableCheck]: "Something went wrong when checking if ENT was available.",
  [ResponseErrorCode.PronoteBannedIP]: "Cette adresse IP a ete temporairement suspendue.",
  [ResponseErrorCode.PronoteClosedInstance]: "Cette instance Pronote est ferme.",
  [ResponseErrorCode.SessionReadData]: "Une erreur est survenue lors du parsing des donnees de session.",
  [ResponseErrorCode.NetworkFail]: "Une erreur reseau est survenue.",
  [ResponseErrorCode.NotMatchingOrders]: "L'ordre local et l'ordre recu ne sont pas egaux.",
  [ResponseErrorCode.NoIVForAESCreated]: "L'IV pour l'encryption AES n'a pas ete cree.",
  [ResponseErrorCode.NotFoundENT]: "ENT actuellement non disponible.",
  [ResponseErrorCode.PronoteTicketFetch]: "Error while fetching the Pronote URL ticket. Please, try again.",
  [ResponseErrorCode.ENTCookiesFetch]: "Error while fetching the ENT cookies. Maybe bad credentials, please try again.",
  [ResponseErrorCode.IncorrectCredentials]: "Nom d'utilisateur ou mot de passe incorrect.",
  [ResponseErrorCode.OngletUnauthorized]: "Votre compte n'est pas autorise a acceder cet onglet."
};

export const CLIENT_ERRORS = {
  [ClientErrorCode.SessionCantRestore]: "Session non recuperable, entrez a nouveau vos identifants.",
  [ClientErrorCode.NetworkFail]: "Une erreur reseau est survenue."
};

// export const APP_BANNER = {
//   case AppBannerMessage.Idle:
//     return "Données à jour.";
//   case AppBannerMessage.FetchingTimetable:
//     return "Récupération de l'emploi du temps...";
//   case AppBannerMessage.FetchingHomeworks:
//     return "Récupération des devoirs...";
//   case AppBannerMessage.RestoringSession:
//     return "Récupération de la session...";
//   case AppBannerMessage.FetchingRessources:
//     return "Récupération des ressources pédagogiques...";
//   case AppBannerMessage.FetchingGrades:
//     return "Récupération des notes...";
//   case AppBannerMessage.UnknownError:
//     return "Une erreur inconnue est survenue.";
//   case AppBannerMessage.NeedCredentials:
//     return "Session expirée, entrez vos identifiants.";
//   }
// }

export default {
  API_ERRORS,
  CLIENT_ERRORS
};
