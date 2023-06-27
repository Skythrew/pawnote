import type { HttpCallFunction } from "@/utils/handlers/create";
import type { SessionInstance } from "@/utils/session";

import { retrieveResponseCookies } from "@/utils/requests/headers";
import { ApiResponseErrorCode, HandlerResponseError } from "@/utils/handlers/errors";

import { serializeError } from "serialize-error";

export enum PronoteApiAccountId {
  Commun = 0,
  Eleve = 6,
  Parent = 2,
  Professeur = 1,
  Accompagnant = 25,
  Entreprise = 4,
  VieScolaire = 13,
  Direction = 16,
  Academie = 5
}

export interface PronoteApiAccountType {
  id: PronoteApiAccountId
  name: string
  path: string
}

export enum PronoteApiFunctions {
  Informations = "FonctionParametres",
  Identify = "Identification",
  Authenticate = "Authentification",
  UserData = "ParametresUtilisateur",
  Timetable = "PageEmploiDuTemps",
  Homeworks = "PageCahierDeTexte",
  Resources = "PageCahierDeTexte",
  Grades = "DernieresNotes",
  HomeworkDone = "SaisieTAFFaitEleve"
}

export enum PronoteApiOnglets {
  Grades = 198,
  Resources = 89,
  Homeworks = 88,
  Timetable = 16
}

export interface PronoteApiSession {
  /** Session ID as a **string**. */
  h: string
  /** Account Type ID. */
  a: PronoteApiAccountId
  /** Whether the instance is demo or not. */
  d: boolean

  /** ENT Username. */
  e?: string
  /** ENT Password. */
  f?: string
  g?: number

  /** Modulus for RSA encryption. */
  MR: string
  /** Exponent for RSA encryption. */
  ER: string

  /** Skip request encryption. */
  sCrA: boolean
  /** Skip request compression. */
  sCoA: boolean
}

export interface PronoteApiFunctionPayload<T> {
  nom: string
  session: number
  numeroOrdre: string

  /** `string` only when compressed and/or encrypted. */
  donneesSec: T | string
}

export interface PronoteApiFunctionError {
  Erreur: {
    G: number
    Message: string
    Titre: string
  }
}

export const cleanPronoteUrl = (url: string): string => {
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
  return pronote_url.href.endsWith("/")
    ? pronote_url.href.slice(0, -1)
    : pronote_url.href;
};

export const createPronoteAPICall = (fetcher: HttpCallFunction) => async <T>(
  function_name: PronoteApiFunctions,
  data: {
    /** Returned value of `Session.writePronoteFunctionPayload`. */
    payload: { order: string, data: T | string }
    /** Force to use this URL instead of the one in `session_instance` */
    pronote_url?: string
    session_instance: SessionInstance
    cookies?: string[]
  }
) => {
  try {
    const pronote_url = typeof data.pronote_url === "string" ? data.pronote_url : data.session_instance.pronote_url;
    const function_url = pronote_url + `/appelfonction/${data.session_instance.account_type_id}/${data.session_instance.session_id}/${data.payload.order}`;
    const response = await fetcher(function_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: data.cookies?.join("; ") ?? ""
      },
      body: JSON.stringify({
        session: data.session_instance.session_id,
        numeroOrdre: data.payload.order,
        nom: function_name,

        donneesSec: data.payload.data
      })
    });

    const payload = await response.text();
    const cookies = retrieveResponseCookies(response.headers);

    return { payload, cookies };
  }
  catch (error) {
    throw new HandlerResponseError(ApiResponseErrorCode.NetworkFail, {
      status: 500,
      debug: { error: serializeError(error) }
    });
  }
};

export const downloadPronotePage = async (fetcher: HttpCallFunction, options: {
  url: string
  cookies?: string[]
}): Promise<{
  /** Data **as text** from the given URL. */
  body: string

  /**
   * Cookies can be given by Pronote for authentification step
   * when a session is being restored OR when using ENT.
   */
  cookies: string[]
}> => {
  try {
    const headers = new Headers();
    headers.set("Cookie", options.cookies?.join("; ") ?? "");

    const response = await fetcher(options.url, {
      method: "GET",
      redirect: "manual",
      headers
    });

    return {
      cookies: retrieveResponseCookies(response.headers),
      body: await response.text()
    };
  }
  catch (error) {
    throw new HandlerResponseError(ApiResponseErrorCode.PronotePageDownload, {
      debug: {
        url: options.url,
        error: serializeError(error)
      }
    });
  }
};

export const extractPronoteSessionFromBody = (body: string): PronoteApiSession => {
  if (body.includes("Votre adresse IP est provisoirement suspendue")) {
    throw new HandlerResponseError(
      ApiResponseErrorCode.PronoteBannedIP
    );
  }

  if (body.includes("Le site n'est pas disponible")) {
    throw new HandlerResponseError(
      ApiResponseErrorCode.PronoteClosedInstance
    );
  }

  try {
    // Remove all spaces and line breaks.
    const body_cleaned = body.replace(/ /ug, "").replace(/\n/ug, "");

    // Find the relaxed JSON of the session.
    const from = "Start(";
    const to = ")}catch";

    const relaxed_data = body_cleaned.substring(
      body_cleaned.indexOf(from) + from.length,
      body_cleaned.indexOf(to)
    );

    // Convert the relaxed JSON to something we can parse.
    const session_data_string = relaxed_data
      .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/gu, "\"$2\": ")
      .replace(/'/gu, "\"");

    const session_data_raw = JSON.parse(session_data_string) as PronoteApiSession;
    return session_data_raw;
  }
  catch (error) {
    throw new HandlerResponseError(ApiResponseErrorCode.SessionReadData, {
      debug: {
        error: serializeError(error),
        body
      }
    });
  }
};
