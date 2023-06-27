import { type PronoteApiAccountType, PronoteApiAccountId } from "@/utils/requests/pronote";

export const PRONOTE_INSTANCE_MOBILE_INFOS_PATH = "infoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4";
export const PRONOTE_GEOLOCATION_URL = "https://www.index-education.com/swie/geoloc.php";

export const PRONOTE_ACCOUNT_TYPES: PronoteApiAccountType[] = [
  {
    id: PronoteApiAccountId.Commun,
    name: "Commun",
    path: "" // No path since the "Commun" account is on root path.
  },
  {
    id: PronoteApiAccountId.Eleve,
    name: "Élève",
    path: "mobile.eleve.html"
  },
  {
    id: PronoteApiAccountId.Parent,
    name: "Parent",
    path: "parent.html"
  },
  {
    id: PronoteApiAccountId.Professeur,
    name: "Professeur",
    path: "professeur.html"
  },
  {
    id: PronoteApiAccountId.Accompagnant,
    name: "Accompagnant",
    path: "accompagnant.html"
  },
  {
    id: PronoteApiAccountId.Entreprise,
    name: "Entreprise",
    path: "entreprise.html"
  },
  {
    id: PronoteApiAccountId.VieScolaire,
    name: "Vie Scolaire",
    path: "viescolaire.html"
  },
  {
    id: PronoteApiAccountId.Direction,
    name: "Direction",
    path: "direction.html"
  },
  {
    id: PronoteApiAccountId.Academie,
    name: "Académie",
    path: "academie.html"
  }
];
