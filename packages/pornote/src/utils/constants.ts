import { PronoteApiAccountId } from "@/types/pronote";

/** URL extracted from the Pronote APK. */
export const GEOLOCATION_API_URL = "https://www.index-education.com/swie/geoloc.php";

export const PRONOTE_ACCOUNT_TYPES: {
  [id in PronoteApiAccountId]: { name: string, path: string }
} = {
  [PronoteApiAccountId.Commun]: {
    name: "Commun",
    path: "" // No path since the "Commun" account is on root path.
  },

  [PronoteApiAccountId.Eleve]: {
    name: "Élève",
    path: "eleve.html"
  },

  [PronoteApiAccountId.Parent]: {
    name: "Parent",
    path: "parent.html"
  },

  [PronoteApiAccountId.Professeur]: {
    name: "Professeur",
    path: "professeur.html"
  },

  [PronoteApiAccountId.Accompagnant]: {
    name: "Accompagnant",
    path: "accompagnant.html"
  },

  [PronoteApiAccountId.Entreprise]: {
    name: "Entreprise",
    path: "entreprise.html"
  },

  [PronoteApiAccountId.VieScolaire]: {
    name: "Vie Scolaire",
    path: "viescolaire.html"
  },

  [PronoteApiAccountId.Direction]: {
    name: "Direction",
    path: "direction.html"
  },

  [PronoteApiAccountId.Academie]: {
    name: "Académie",
    path: "academie.html"
  }
};
