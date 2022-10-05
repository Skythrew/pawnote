import { PronoteApiAccountId } from "@/types/pronote";

export const HEADERS_PRONOTE = {
  /**
   * `User-Agent` to send with every request.
   * If you don't request with the same `User-Agent` on every
   * Pronote request, it will fail and log you out.
   *
   * Here, we use Chrome on version 106 running in Windows as User-Agent.
   */
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
};

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
