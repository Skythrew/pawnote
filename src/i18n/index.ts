import { AppBannerMessage } from "@/stores/app";
//import { ResponseErrorCode, ClientErrorCode } from "@/types/errors";

export const languages = {
  "en-US": () => import("./en-US")
};

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
  case AppBannerMessage.FetchingGrades:
    return "Récupération des notes...";
  case AppBannerMessage.UnknownError:
    return "Une erreur inconnue est survenue.";
  case AppBannerMessage.NeedCredentials:
    return "Session expirée, entrez vos identifiants.";
  }
};

export const translateErrorCode = async (code: number) => {
  const lang = "en-US"; // TODO: Make it configurable.
  const local = await languages[lang]();

  return local.ERRORS[code] ?? "UnknownError";
};
