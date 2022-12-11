import type { Accessor } from "solid-js";
import type { SessionExported } from "@/types/session";

import type {
  Response,
  ResponseError,
  ApiLoginInformations,
  ApiLoginIdentify,
  ApiLoginAuthenticate,
  ApiLoginEntCookies,
  ApiLoginEntTicket,
  ApiUserTimetable,
  ApiUserHomeworks,
  ApiUserData,
  ApiUserRessources,
  ApiUserGrades,
  ApiUserHomeworkDone
} from "@/types/api";

import { aes, capitalizeFirstLetter, credentials as credentials_utility } from "@/utils/globals";
import { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";

import {
  type PronoteApiUserData,
  type PronoteApiUserHomeworks,
  type PronoteApiUserTimetable,

  PronoteApiUserTimetableContentType,
  PronoteApiAccountId,
  PronoteApiOnglets,
  PronoteApiUserGrades
} from "@/types/pronote";

import {
  ResponseErrorCode,
  ClientErrorCode
} from "@/types/errors";

import SessionFromScratchModal from "@/components/modals/SessionFromScratch";

import app, { AppStateCode } from "@/stores/app";
import credentials from "@/stores/credentials";
import endpoints from "@/stores/endpoints";
import sessions from "@/stores/sessions";

import { context as locale } from "@/locales";

import { decode as html_entities_decode } from "html-entities";
import { unwrap } from "solid-js/store";
import Session from "@/utils/session";
import toast from "solid-toast";
import forge from "node-forge";
import dayjs from "dayjs";

import dayjsCustomDuration from "dayjs/plugin/duration";
import dayjsCustomParse from "dayjs/plugin/customParseFormat";

dayjs.extend(dayjsCustomParse);
dayjs.extend(dayjsCustomDuration);

/** Helper class for easier error handling. */
export class ApiError extends Error {
  public debug?: ResponseError["debug"];
  public code: ResponseErrorCode;
  public message: string;

  constructor (response: Omit<ResponseError, "success">) {
    const [t] = locale;

    const error_message = t(`API_ERRORS.${response.code}`);
    toast(error_message);

    const message = `ResponseErrorCode[#${response.code}]: ${error_message}`;
    super(message);

    this.name = "ApiError";
    this.debug = response.debug;
    this.code = response.code;
    this.message = message;
  }
}

/** Helper class for easier error handling. */
export class ClientError extends Error {
  public debug?: ResponseError["debug"];
  public message: string;

  constructor (response: { code: number, debug?: unknown }) {
    const [t] = locale;

    const error_message = t(`CLIENT_ERRORS.${response.code}`);
    toast(error_message);

    const message = `ClientErrorCode[#${response.code}]: ${error_message}`;
    super(message);

    this.name = "ClientError";
    this.debug = response.debug;
    this.message = message;
  }
}

/** @example `readFloatFromString("10.45")` transforms "10,45" into 10.45 */
export const readFloatFromString = (value: string) => parseFloat(value.replace(",", "."));

/** TODO: Use an enum and also give translation for the strings. */
export const readGradeValue = (value: string) => {
  switch (value) {
  case "|1":
    return "Absent";
  case "|3":
    return "N. Noté";
  case "|5":
    return "N. Rendu";
  default: {
    const result = readFloatFromString(value);
    return Number.isNaN(result) ? "?" : result;
  }
  }
};

export const callAPI = async <Api extends {
  path: string;
  request: unknown;
  response: unknown;
}>(
  path_raw: Api["path"] | Accessor<Api["path"]>,
  body: Accessor<Api["request"]>,
  options: {
    /** Prevents the response from being saved in the localForage. */
    prevent_cache?: boolean;
    /**
      * When we receive an SessionExpired error,
    * we restore a new session but don't run a new call.
      */
    prevent_catch_rerun?: boolean;
  } = {
    prevent_cache: false,
    prevent_catch_rerun: false
  }
): Promise<Api["response"]> => {
  const path = () => typeof path_raw === "function"
    ? (path_raw as Accessor<Api["path"]>)()
    : path_raw as Api["path"];

  const url = () => "/api" + path();

  const request = await fetch(url(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body())
  }).catch(() => {
    throw new ClientError({
      code: ClientErrorCode.NetworkFail
    });
  });

  const user = app.current_user;
  const response = await request.json() as Response<Api["response"]>;

  if (!response.success) {
    if (response.code === ResponseErrorCode.SessionExpired) {
      if (user.slug) {
        const old_session = user.session;

        // When the session expired while connected to a user.
        const creds = await credentials.get(user.slug);
        let data: Awaited<ReturnType<typeof connectToPronote>> | undefined;

        // Directly use the crendentials when we have them.
        if (creds) {
          data = await connectToPronote({
            pronote_url: old_session.instance.pronote_url,
            use_credentials: true,
            username: creds.username,
            password: creds.password,
            ...(old_session.instance.use_ent
              ? { // When creating a new session using ENT cookies.
                use_ent: true,
                ent_url: old_session.instance.ent_url as string
              }
              : { // When restoring a session using Pronote cookies.
                use_ent: false,
                account_type: old_session.instance.account_type_id
              }
            )
          });
        }
        // Use the cookies otherwise, but session restoring can fail.
        else {
          data = await connectToPronote({
            pronote_url: old_session.instance.pronote_url,
            use_credentials: false,
            ...(old_session.instance.use_ent
              ? { // When creating a new session using ENT cookies.
                use_ent: true,
                ent_cookies: old_session.instance.ent_cookies,
                ent_url: old_session.instance.ent_url as string
              }
              : { // When restoring a session using Pronote cookies.
                use_ent: false,
                account_type: old_session.instance.account_type_id,
                pronote_cookies: old_session.instance.pronote_cookies
              }
            )
          });
        }

        if (!data) {
          throw new ClientError({
            code: ClientErrorCode.SessionCantRestore
          });
        }

        const is_saved = await sessions.upsert(user.slug, data.session);

        // Endpoints with some session defined ID
        // can't be saved because these IDs are renewed.
        await endpoints.removeAllStartingWith(user.slug, "/user/grades/");

        if (is_saved) {
          await endpoints.upsert<ApiUserData>(
            user.slug, "/user/data", data.endpoints["/user/data"]
          );

          await endpoints.upsert<ApiLoginInformations>(
            user.slug, "/login/informations", data.endpoints["/login/informations"]
          );
        }

        toast("La session a été restorée.");
        if (options.prevent_catch_rerun) throw new ApiError(response);

        return callAPI<Api>(path, body, options);
      }

      // Should be a first-time login.
      else {
        throw new ApiError({
          code: ResponseErrorCode.RequestPayloadBroken
        });
      }
    }

    throw new ApiError(response);
  }

  // When we want to store the data, we also need a slug.
  // When the response contains a session or a Pronote response, we store it.
  if (user.slug) {
    const typed_response = response.data as unknown as {
      session?: SessionExported;
      received?: unknown;
    };

    typed_response.session && await sessions.upsert(user.slug, typed_response.session);
    !options.prevent_cache && typed_response.received && await endpoints.upsert(user.slug, path(), typed_response.received);
  }

  return response.data;
};

/**
 * Helper function to get user's position
 * using Geolocation API in a Promise.
 *
 * @example
 * // Assuming the browser supports Geolocation API.
 * const { coords } = await getGeolocationPosition();
 * console.log(coords.latitude, coords.longitude);
 */
export const getGeolocationPosition = (options?: PositionOptions): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  );
};

/** Helper for classes with TailwindCSS. */
export const classNames = (...classes: (string | boolean | undefined)[]): string =>
  classes.filter(Boolean).join(" ");

export const guessPronoteAccountTypeFromUrl = (raw_url: string) => {
  const pronote_url = new URL(raw_url);
  const account_type_path = pronote_url.pathname.split("/").pop();

  const result = Object.entries(PRONOTE_ACCOUNT_TYPES).find(
    entry => entry[1].path === account_type_path
  );

  if (!result) return null;
  const account_type_id = parseInt(result[0]) as PronoteApiAccountId;
  return account_type_id;
};

export const connectToPronote = async (options: {
  // We always need the base Pronote URL,
  // in case it has been modified.
  pronote_url: string;
} & (
  | {
    use_ent: false;
    use_credentials: true;

    username: string;
    password: string;
    account_type: PronoteApiAccountId;
  }
  | {
    use_ent: true;
    use_credentials: true;

    username: string;
    password: string;
    ent_url: string;
  }
  | {
    use_ent: true;
    use_credentials: false;

    ent_cookies: string[];
    ent_url: string;
  }
  | {
    use_ent: false;
    use_credentials: false;

    pronote_cookies: string[];
    account_type: PronoteApiAccountId;
  }
)) => {
  let pronote_username = !options.use_ent && options.use_credentials ? options.username : "";
  let pronote_password = !options.use_ent && options.use_credentials ? options.password : "";

  let ent_cookies: string[] = options.use_ent && !options.use_credentials
    // Use given cookies when not using credentials.
    ? options.ent_cookies
    : []; // Empty array since we gonna fetch them later.

  if (options.use_ent && options.use_credentials) {
    const ent_cookies_response = await callAPI<ApiLoginEntCookies>("/login/ent_cookies", () => ({
      ent_url: options.ent_url,
      credentials: credentials_utility.encode({
        username: options.username,
        password: options.password
      })
    }), { prevent_cache : true });

    ent_cookies = ent_cookies_response.ent_cookies;
  }

  // When we fetch a Pronote ticket, we'll need to use the RAW given URL.
  let pronote_url = options.pronote_url;

  if (options.use_ent) {
    const ent_ticket_response = await callAPI<ApiLoginEntTicket>("/login/ent_ticket", () => ({
      ent_url: options.ent_url,
      ent_cookies
    }), { prevent_cache : true });

    pronote_url = ent_ticket_response.pronote_url;
  }

  const account_type = options.use_ent
    // Guess the account type using the constants we have.
    ? guessPronoteAccountTypeFromUrl(pronote_url)
    // When not using ENT, just use the given account type.
    : options.account_type;

  // When we can't guess the account type, just abort.
  // TODO: Find a way to handle this. I don't know how, but I will.
  if (account_type === null) return null;

  let pronote_cookies: string[] = !options.use_ent && !options.use_credentials
    // Use given cookies if we're restoring a basic session.
    ? options.pronote_cookies
    : []; // We'll define some cookies for session restoring, later.

  const informations_response = await callAPI<ApiLoginInformations>("/login/informations", () => ({
    cookies: pronote_cookies,
    account_type,
    pronote_url,

    // If the URL is not the same, we should use it as raw.
    raw_url: options.pronote_url !== pronote_url
  }), { // Here, we prevent the cache even if we'll cache it later.
    prevent_cache: true
  });

  // Add cookies we got from the request.
  for (const cookie of informations_response.cookies) {
    pronote_cookies.push(cookie);
  }

  // Updating the login credentials to use depending of the received response.
  if (informations_response.setup) {
    pronote_username = informations_response.setup.username;
    pronote_password = informations_response.setup.password;
  }

  if (!pronote_username || !pronote_password) {
    // Ask for new credentials.
    // User can choose if they'll be saved or not.
    SessionFromScratchModal.show();

    throw new ClientError({
      code: ClientErrorCode.SessionCantRestore
    });
  }

  const identify_response = await callAPI<ApiLoginIdentify>("/login/identify", () => ({
    pronote_username,
    cookies: pronote_cookies,
    session: informations_response.session
  }), { prevent_cache: true });

  if (identify_response.received.donnees.modeCompLog) {
    pronote_username = pronote_username.toLowerCase();
  }

  if (identify_response.received.donnees.modeCompMdp) {
    pronote_password = pronote_password.toLowerCase();
  }

  // Short-hand for later usage.
  const aesIvBuffer = forge.util.createBuffer(identify_response.session.encryption.aes.iv as string);

  /// Resolving the challenge - Part 1.
  /// Decoding the challenge from hex to bytes and decrypting it with AES.

  // Generate the hash for the AES key.
  const challengeAesKeyHash = forge.md.sha256.create()
    .update(informations_response.setup
      ? "" // When using generated credentials, we don't have to use `alea`.
      : identify_response.received.donnees.alea
    )
    .update(forge.util.encodeUtf8(pronote_password))
    .digest();

  const challengeAesKey = (informations_response.setup
    ? "" // When using generated credentials, we don't have to lowercase.
    : pronote_username.toLowerCase()
  ) +  challengeAesKeyHash.toHex().toUpperCase();

  const challengeAesKeyBuffer = forge.util.createBuffer(
    forge.util.encodeUtf8(challengeAesKey)
  );

  const challengeDecryptedBytes = aes.decrypt(identify_response.received.donnees.challenge, {
    iv: aesIvBuffer,
    key: challengeAesKeyBuffer
  });

  let resolved_challenge: string | undefined;

  try {
    /// Resolving the challenge - Part 2.
    /// Modifying the plain text by removing every second character.

    const challengeDecrypted = forge.util.decodeUtf8(challengeDecryptedBytes);

    const challengeDecryptedUnscrambled = new Array(challengeDecrypted.length);
    for (let i = 0; i < challengeDecrypted.length; i += 1) {
      if (i % 2 === 0) {
        challengeDecryptedUnscrambled.push(challengeDecrypted.charAt(i));
      }
    }

    /// Resolving the challenge - Part 3.
    /// Encrypting the modified text back with AES and encoding it as hex.
    resolved_challenge = aes.encrypt(challengeDecryptedUnscrambled.join(""), {
      iv: aesIvBuffer,
      key: challengeAesKeyBuffer
    });

  }
  catch {
    throw new ApiError({ code: ResponseErrorCode.IncorrectCredentials });
  }

  // Send the resolved challenge.
  const authenticate_response = await callAPI<ApiLoginAuthenticate>("/login/authenticate", () => ({
    solved_challenge: resolved_challenge!,
    session: identify_response.session,
    cookies: pronote_cookies
  }), { prevent_cache: true });

  // Remove the stored cookie "CASTJU" if exists.
  pronote_cookies = pronote_cookies.filter(cookie => !cookie.startsWith("CASTJU="));

  const decryptedAuthKey = aes.decrypt(authenticate_response.received.donnees.cle, {
    iv: aesIvBuffer,
    key: challengeAesKeyBuffer
  });

  /** Get the new AES key that will be used in our requests. */
  const authKeyBytesArray = new Uint8Array(decryptedAuthKey.split(",").map(a => parseInt(a)));
  const authKey = forge.util.createBuffer(authKeyBytesArray).bytes();

  /// Update the authenticated session we previously got
  /// and let the "/user/data" endpoint do the final touches.

  authenticate_response.session.encryption.aes.key = authKey;
  authenticate_response.session.instance.pronote_cookies = pronote_cookies;

  authenticate_response.session.instance.use_ent = options.use_ent;
  authenticate_response.session.instance.ent_cookies = ent_cookies;
  authenticate_response.session.instance.ent_url = options.use_ent ? options.ent_url : null;

  const user_data_response = await callAPI<ApiUserData>("/user/data", () => ({
    session: authenticate_response.session
  }), { // Here, we prevent the cache even if we'll cache it later.
    prevent_cache : true
  });

  /// Preparing to export datas.
  /// We export a method to directly store the data with a slug
  /// and we export also the endpoints and the session to use without saving.

  const _session = user_data_response.session;
  const _endpoints = {
    "/user/data": user_data_response.received,
    "/login/informations": informations_response.received
  };

  return {
    session: _session,
    endpoints: _endpoints
  };
};

/** Gets the current week number based on current user's session. */
export const getCurrentWeekNumber = (): number => {
  return getWeekNumber(dayjs());
};

export const getWeekNumber = (date: dayjs.Dayjs): number => {
  const user = app.current_user;
  if (!user.slug) return 0;

  const first_date_raw = user.endpoints["/login/informations"].donnees.General.PremierLundi.V;
  const first_date = dayjs(first_date_raw, "DD-MM-YYYY");
  const days_since_first = date.diff(first_date, "days");
  const week_number = 1 + Math.floor(days_since_first / 7);

  return week_number;
};

export const callUserTimetableAPI = async (
  week: number,
  options: { force?: boolean, queue?: boolean } = { force: false, queue: true }
) => {
  const user = app.current_user;
  if (!user.slug) throw new ApiError ({
    code: ResponseErrorCode.UserUnavailable
  });

  const endpoint: ApiUserTimetable["path"] = `/user/timetable/${week}`;
  const local_response = await endpoints.get<ApiUserTimetable>(user.slug, endpoint);
  if (local_response && !local_response.expired && !options.force) return local_response;

  const call = async () => {
    console.info("[timetable] renew");

    await callAPI<ApiUserTimetable>(endpoint, () => ({
      ressource: user.endpoints["/user/data"].donnees.ressource,
      session: user.session
    }));
  };

  if (options.queue) {
    app.enqueue_fetch(AppStateCode.FetchingTimetable, call);
    return local_response?.data;
  }

  app.setCurrentState({ code: AppStateCode.FetchingTimetable, fetching: true });
  await call();
  app.setStateToIdle();
};

export interface TimetableLesson {
  type: "lesson";

  date: dayjs.Dayjs;
  duration: number;
  position: number;
  color: string;

  name?: string;
  room?: string;
  teacher?: string;
  status?: string;
}

export interface TimetableBreak {
  type: "break";

  from: number;
  to: number;
}

export const parseTimetableLessons = (
  lessons_raw: PronoteApiUserTimetable["response"]["donnees"]["ListeCours"]
) => {
  console.info("[timetable]: start parsing");

  const general_data = app.current_user.endpoints?.["/login/informations"].donnees.General;
  if (!general_data) return [] as TimetableLesson[][];

  const lessons = unwrap(lessons_raw)
    .sort((a, b) => a.place - b.place)
    .filter(lesson => !lesson.estAnnule);

  /**
   * Lessons are stored in an array for each day.
   * So the structure is basically `dayOfWeek[lesson[]]`,
   * where `dayOfWeek` is a number and starts from 0 for Sunday.
   */
  const raw_output: (TimetableLesson | TimetableBreak)[][] = [...Array.from(Array(7), () => [])];
  for (let lesson_index = 0; lesson_index < lessons.length; lesson_index++) {
    const lesson = lessons[lesson_index];

    const getDate = (item: typeof lesson) => {
      return dayjs(item.DateDuCours.V, "DD-MM-YYYY HH:mm:ss");
    };

    const getPositionOf = (item: typeof lesson) => {
      return item.place - (general_data.PlacesParJour * (getDate(item).day() - 1));
    };

    // Since dayOfWeek starts from Sunday, we remove 1
    // to start from Monday.
    const position = getPositionOf(lesson);
    const dayOfWeek = getDate(lesson).day();

    if (lesson_index === 0 && lesson.place !== 0) {
      const break_item: TimetableBreak = {
        type: "break",
        from: 0,
        to: position
      };

      raw_output[dayOfWeek].push(break_item);
    }

    const before_lesson = lessons[lesson_index - 1];
    if (before_lesson) {
      if (lesson.place - before_lesson.duree !== before_lesson.place) {
        const before_lesson_position = getPositionOf(before_lesson) + before_lesson.duree;
        if (before_lesson_position <= position) {
          const break_item: TimetableBreak = {
            type: "break",
            from: before_lesson_position,
            to: position
          };

          raw_output[dayOfWeek].push(break_item);
        }
        else {
          if (position !== 0) {

            const break_item: TimetableBreak = {
              type: "break",
              from: 0,
              to: position
            };

            raw_output[dayOfWeek].push(break_item);
          }
        }
      }
    }

    const parsed_lesson: TimetableLesson = {
      type: "lesson",
      date: getDate(lesson),
      position,
      duration: lesson.duree,
      color: lesson.CouleurFond,
      status: lesson.Statut
    };

    for (const content of lesson.ListeContenus.V) {
      switch (content.G) {
      case PronoteApiUserTimetableContentType.Subject:
        parsed_lesson.name = content.L;
        break;
      case PronoteApiUserTimetableContentType.Room:
        parsed_lesson.room = content.L;
        break;
      case PronoteApiUserTimetableContentType.Teacher:
        parsed_lesson.teacher = content.L;
        break;
      }
    }

    // Add the lesson to that day.
    raw_output[dayOfWeek].push(parsed_lesson);
  }

  console.info("[timetable]: done");
  return raw_output;
};

export const getLabelOfPosition = (position: number) => {
  return app.current_user.endpoints?.["/login/informations"].donnees.General.ListeHeures.V.find(
    item => item.G === position
  )?.L;
};

export const getTimeFormattedDiff = (
  a: {
    value: string,
    format: string
  },
  b: {
    value: string,
    format: string
  },
  format: string
) => {
  const date_a = dayjs(a.value, a.format);
  const date_b = dayjs(b.value, b.format);

  const diff = date_b.diff(date_a);
  const duration = dayjs.duration(diff);

  return duration.format(format);
};

export const callUserHomeworksAPI = async (
  week: number,
  options: { force?: boolean, queue?: boolean } = { force: false, queue: true }
) => {
  const user = app.current_user;
  if (!user.slug) throw new ApiError ({
    code: ResponseErrorCode.UserUnavailable
  });

  const endpoint: ApiUserHomeworks["path"] = `/user/homeworks/${week}`;
  const local_response = await endpoints.get<ApiUserHomeworks>(user.slug, endpoint);
  if (local_response && !local_response.expired && !options.force) return local_response;

  const call = async () => {
    console.info("[homeworks] renew");

    await callAPI<ApiUserHomeworks>(endpoint, () => ({
      session: user.session
    }));
  };

  if (options.queue) {
    app.enqueue_fetch(AppStateCode.FetchingHomeworks, call);
    return local_response?.data;
  }

  app.setCurrentState({ code: AppStateCode.FetchingHomeworks, fetching: true });
  await call();
  app.setStateToIdle();
};

export interface Homework {
  id: string;

  subject_name: string;
  subject_color: string;

  description: string;
  attachments: { id: string, name: string }[];
  done: boolean;
}

/**
  * Sort the homeworks by the day they need to be done.
  * Returned object keys is from 0 to 6 (where 0 is Sunday and 6 is Saturday
  * Each item is an array containing the homeworks for that day.
  */
export const parseHomeworks = (homeworks: PronoteApiUserHomeworks["response"]["donnees"]) => {
  console.info("[debug][homeworks]: parse");

  const output: { [key: number]: Homework[] } = {};

  for (const homework of homeworks.ListeTravauxAFaire.V) {
    const date = dayjs(homework.PourLe.V, "DD-MM-YYYY");
    const day = date.day();

    // Initialize the array for the day if doesn't exist.
    if (!output[day]) output[day] = [];

    output[day].push({
      id: homework.N,
      done: homework.TAFFait,
      description: homework.descriptif.V,

      subject_name: homework.Matiere.V.L,
      subject_color: homework.CouleurFond,

      attachments: homework.ListePieceJointe.V.map(attachment => ({
        id: attachment.N,
        name: html_entities_decode(attachment.L)
      }))
    });
  }

  return output;
};

export const callUserRessourcesAPI = async (
  week: number,
  options: { force?: boolean, queue?: boolean } = { force: false, queue: true }
) => {
  const user = app.current_user;
  if (!user.slug) throw new ApiError ({
    code: ResponseErrorCode.UserUnavailable
  });

  const endpoint: ApiUserRessources["path"] = `/user/ressources/${week}`;
  const local_response = await endpoints.get<ApiUserRessources>(user.slug, endpoint);
  if (local_response && !local_response.expired  && !options.force) return local_response;

  const call = async () => {
    console.info("[ressources]: renew");

    await callAPI<ApiUserRessources>(endpoint, () => ({
      session: user.session
    }));
  };

  if (options.queue) {
    app.enqueue_fetch(AppStateCode.FetchingRessources, call);
    return local_response?.data;
  }

  app.setCurrentState({ code: AppStateCode.FetchingRessources, fetching: true });
  await call();
  app.setStateToIdle();
};

export const getDefaultPeriodOnglet = (onglet_id: PronoteApiOnglets) => {
  const user = app.current_user;
  if (!user.slug) throw new ApiError ({
    code: ResponseErrorCode.UserUnavailable
  });

  const user_data = () => user.endpoints["/user/data"];
  const onglet = () => user_data().donnees.ressource.listeOngletsPourPeriodes.V.find(
    onglet => onglet.G === onglet_id
  );

  if (!onglet()) throw new ApiError ({
    code: ResponseErrorCode.OngletUnauthorized
  });

  const period = onglet()?.listePeriodes.V.find(
    period => period.N === onglet()?.periodeParDefaut.V.N
  );

  if (!period) throw new ApiError ({
    code: ResponseErrorCode.OngletUnauthorized
  });

  return period;
};

export const getCurrentPeriod = (periods: PronoteApiUserData["response"]["donnees"]["ressource"]["listeOngletsPourPeriodes"]["V"][number]["listePeriodes"]["V"]) => {
  const user = app.current_user;
  if (!user.slug) throw new ApiError ({
    code: ResponseErrorCode.UserUnavailable
  });

  const login_informations = () => user.endpoints["/login/informations"];
  const periods_info = login_informations().donnees.General.ListePeriodes.filter(
    period_info => periods.find(
      period => period.N === period_info.N
    )
  )
    .map(
      period => ({
        ...period,
        dateDebut: dayjs(period.dateDebut.V, "DD-MM-YYYY"),
        dateFin: dayjs(period.dateFin.V, "DD-MM-YYYY")
      })
    );

  const today = dayjs();
  const current_period = periods_info.find(
    period => today.isBefore(period.dateFin) && today.isAfter(period.dateDebut)
  );

  return current_period;
};

export const callUserGradesAPI = async (
  period: Accessor<ApiUserGrades["request"]["period"]>,
  options: { force?: boolean, queue?: boolean } = { force: false, queue: true }
) => {
  const user = app.current_user;
  if (!user.slug) throw new ApiError ({
    code: ResponseErrorCode.UserUnavailable
  });

  const endpoint = (): ApiUserGrades["path"] => `/user/grades/${period().N}`;
  const local_response = await endpoints.get<ApiUserGrades>(user.slug, endpoint());
  if (local_response && !local_response.expired && !options.force) return local_response;

  const call = async () => {
    console.info("[grades]: renew");

    await callAPI<ApiUserGrades>(endpoint, () => ({
      session: user.session,
      period: period()
    }), { prevent_catch_rerun: true });
  };

  if (options.queue) {
    app.enqueue_fetch(AppStateCode.FetchingGrades, call);
    return local_response?.data;
  }

  app.setCurrentState({ code: AppStateCode.FetchingGrades, fetching: true });
  await call();
  app.setStateToIdle();
};

export interface Grade {
  description: string;
  date: dayjs.Dayjs;

  /** Maxmimum grade that can be obtained. */
  maximum: number;
  /** Average grade. */
  average: number | string;
  optional: boolean;
  ratio: number;

  /** Grade obtained by the current user. */
  user: number | string;
  /** Maximum grade obtained by an user. */
  user_max: number | string;
  /** Minimum grade obtained by an user. */
  user_min: number | string;

  subject_id: string;
  subject_color: string;
  subject_name: string;
}

export interface GradeSubject {
  name: string;
  color: string;

  user_average: number | string;
  global_average: number | string;

  max_average: number | string;
  min_average: number | string;

  grades: Grade[];
}

export const parseGrade = (grade: PronoteApiUserGrades["response"]["donnees"]["listeDevoirs"]["V"][number]): Grade => ({
  description: grade.commentaire,
  date: dayjs(grade.date.V, "DD-MM-YYYY"),

  maximum: readFloatFromString(grade.bareme.V),
  average: readGradeValue(grade.moyenne.V),
  optional: grade.estFacultatif,
  ratio: grade.coefficient,

  user: readGradeValue(grade.note.V),
  user_max: readGradeValue(grade.noteMax.V),
  user_min: readGradeValue(grade.noteMin.V),

  subject_id: grade.service.V.N,
  subject_color: grade.service.V.couleur,
  subject_name: grade.service.V.L
});

export const parseGrades = (raw_grades: PronoteApiUserGrades["response"]["donnees"]["listeDevoirs"]["V"]) => {
  const grades: Grade[] = [];

  // Add grades to the `subjects` object.
  for (const raw_grade of raw_grades) {
    grades.push(parseGrade(raw_grade));
  }

  return grades;
};

export const parseGradesIntoSubjects = (data: PronoteApiUserGrades["response"]["donnees"]) => {
  const subjects: { [subject_id: string]: GradeSubject } = {};

  // Store every subjects in the object.
  for (const subject of data.listeServices.V) {
    subjects[subject.N] = {
      name: subject.L,
      color: subject.couleur,

      global_average: readGradeValue(subject.moyClasse.V),
      user_average: readGradeValue(subject.moyEleve.V),

      max_average: readGradeValue(subject.moyMax.V),
      min_average: readGradeValue(subject.moyMin.V),

      grades: []
    };
  }

  const grades = parseGrades(data.listeDevoirs.V);

  // Add grades to the `subjects` object.
  for (const grade of grades) {
    subjects[grade.subject_id].grades.push(grade);
  }

  // Sort the grades with the latest first.
  for (const subject_id of Object.keys(subjects)) {
    subjects[subject_id].grades.sort(
      (a, b) => a.date.isBefore(b.date) ? 1 : -1
    );
  }

  return subjects;
};

export const getDayNameFromDayNumber = (day_number: string | number) => {
  if (typeof day_number === "string") day_number = parseInt(day_number);

  const day_name_lowercase = dayjs()
    .day(day_number)
    .toDate()
    .toLocaleDateString(undefined /** We use `undefined` to choose the value automatically. */, {
      weekday: "long"
    })
    .toLowerCase();

  const day_name = capitalizeFirstLetter(day_name_lowercase);
  return day_name;
};

/**
 * Calls the API and automatically updates
 * the endpoints with the correct data.
 */
export const callUserHomeworkDoneAPI = async (options: {
   homework_id: string;
   week_number: number;
   done?: boolean;
}) => {
  if (!navigator.onLine) throw new ClientError ({
    code: ClientErrorCode.Offline
  });

  const user = app.current_user;
  if (!user.slug) throw new ApiError ({
    code: ResponseErrorCode.UserUnavailable
  });

  const endpoint: ApiUserHomeworkDone["path"] = `/user/homework/${options.homework_id}/done`;

  app.enqueue_fetch(AppStateCode.ChangingHomeworkState, async () => {
    const homeworks_endpoint: ApiUserHomeworks["path"] = `/user/homeworks/${options.week_number}`;

    // Call the API to update the homework state.
    await callAPI<ApiUserHomeworkDone>(endpoint, () => ({
      session: user.session,
      done: options.done ?? true
    }), {
      prevent_cache: true,
      prevent_catch_rerun: true
    });

    // Update local state for the homeworks endpoint.
    app.setCurrentUser(
      "endpoints", `/user/homeworks/${options.week_number}`,
      "donnees", "ListeTravauxAFaire", "V",
      homework => homework.N === options.homework_id,
      "TAFFait", options.done ?? true
    );

    // Update cached data for the homeworks endpoint.
    // We use the raw database and not the `upsert` function because
    // we already updated the `app.current_user.endpoints` store previously
    // and using `upsert` would update the store twice.
    await endpoints.raw_database(user.slug).setItem(homeworks_endpoint, {
      received: unwrap(app.current_user.endpoints?.[homeworks_endpoint]),
      date: Date.now()
    });
  });
};

export const createExternalFileURL = (options: { id: string, name: string }) => {
  const user_session = app.current_user.session;
  if (!user_session) throw new ApiError({ code: ResponseErrorCode.UserUnavailable });
  const session = Session.importFromObject(user_session);

  let result = session.instance.pronote_url + "/FichiersExternes/";
  result += aes.encrypt(JSON.stringify({
    L: options.name,
    N: options.id,
    A: true,
    E: 0
  }), {
    key: forge.util.createBuffer(session.encryption.aes.key as string),
    iv: forge.util.createBuffer(session.encryption.aes.iv as string)
  });

  result += "/" + options.name;
  result += "?Session=" + session.instance.session_id;
  return result;
};

/** We assume that the app.current_user store is already populated. */
export const renewAPIsSync = async () => {
  const current_week = getCurrentWeekNumber();

  // Call the timetable API first because this request is safe
  // against session errors.
  // If the session expired, it will automatically create a new one from this.
  await callUserTimetableAPI(current_week, { force: true, queue: false });

  // When a new session is set, we should refresh the homeworks
  // to update the homeworks' ID to make the `UserHomeworkDone` API work.
  await callUserHomeworksAPI(current_week, { force: true, queue: false });
  await callUserRessourcesAPI(current_week, { queue: false });

  const periods = () => app.current_user.endpoints?.["/user/data"].donnees.ressource.listeOngletsPourPeriodes.V.find(
    onglet => onglet.G === PronoteApiOnglets.Grades
  )?.listePeriodes.V;
  const current_period = () => getCurrentPeriod(periods()!)!;

  await callUserGradesAPI(current_period as unknown as Accessor<ApiUserGrades["request"]["period"]>, { queue: false });
};
