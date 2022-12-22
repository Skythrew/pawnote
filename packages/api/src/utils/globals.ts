import { HttpCallFunction, ResponseError, ResponseSuccess, Response } from "@/types/internals";
import { PronoteApiAccountId } from "@/types/pronote_api";

export const cleanPronoteUrl = (url: string) => {
  let pronote_url = new URL(url);
  // Clean any unwanted data from URL.
  pronote_url = new URL(`${pronote_url.protocol}//${pronote_url.host}${pronote_url.pathname}`);

  // Clear the last path if we're not main selection menu.
  const paths = pronote_url.pathname.split("/");
  if (paths[paths.length - 1].includes(".html")) {
    paths.pop();
  }

  // Rebuild URL with cleaned paths.
  pronote_url.pathname = paths.join("/");

  // Return rebuilt URL without trailing slash.
  return pronote_url.href.endsWith("/") ?
    pronote_url.href.slice(0, -1) :
    pronote_url.href;
};

export interface PronoteAccountType {
  id: PronoteApiAccountId;
  name: string;
  path: string;
}

export const PRONOTE_ACCOUNT_TYPES: PronoteAccountType[] = [
  {
    id: PronoteApiAccountId.Commun,
    name: "Commun",
    path: "" // No path since the "Commun" account is on root path.
  },
  {
    id: PronoteApiAccountId.Eleve,
    name: "Élève",
    path: "eleve.html"
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

export const createApiFunction = <T extends {
  request: unknown;
  response: unknown;
}>(callback: (
  req: { fetch: HttpCallFunction, body: T["request"] },
  res: {
    error: (data: Omit<ResponseError, "success">, options?: { status?: number }) => { response: ResponseError, status: number },
    success: (data: T["response"]) => { response: ResponseSuccess<T["response"]>, status: 200 }
  }
) => Promise<{ response: Response<T["response"]>, status: number }>) => {
  return (fetcher: HttpCallFunction, body: T["request"]) => callback({
    fetch: fetcher,
    body
  }, {
    success: (data) => ({ response: { success: true, data }, status: 200 }),
    error: (data, options) => ({ response: { success: false, code: data.code, debug: data.debug }, status: options?.status ?? 500 })
  })
};
