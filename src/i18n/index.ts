import { AppBannerMessage } from "@/stores/app";

export const appBannerMessageToString = (message: AppBannerMessage) => {
  switch (message) {
  case AppBannerMessage.Idle:
    return "Données à jour.";
  case AppBannerMessage.FetchingTimetable:
    return "Récupération de l'emploi du temps...";
  case AppBannerMessage.FetchingHomeworks:
    return "Récupération des devoirs...";
  case AppBannerMessage.RestoringSession:
    return "Récupération de la session...";
  case AppBannerMessage.FetchingRessources:
    return "Récupération des ressources pédagogiques...";
  case AppBannerMessage.UnknownError:
    return "Une erreur inconnue est survenue.";
  case AppBannerMessage.NeedCredentials:
    return "Session expirée, entrez vos identifiants.";
  }
};
