import type {
  Response,
  ResponseError,
  ApiLoginInformations,
  ApiLoginIdentify,
  ApiLoginAuthenticate,
  ApiLoginEntCookies,
  ApiLoginEntTicket,
  ApiUserTimetable,
  ApiUserData
} from "@/types/api";

import { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";

import { PronoteApiAccountId, PronoteApiUserTimetableContentType } from "@/types/pronote";
import { ResponseErrorMessage } from "@/types/api";

import app, { AppBannerMessage } from "@/stores/app";
import endpoints from "@/stores/endpoints";
import sessions from "@/stores/sessions";
import { aes } from "@/utils/globals";

import forge from "node-forge";
import dayjs from "dayjs";

import dayjsCustomParse from "dayjs/plugin/customParseFormat";
import { SessionExported } from "@/types/session";
dayjs.extend(dayjsCustomParse);

/** Helper class for easier error handling. */
export class ApiError extends Error {
  public debug?: ResponseError["debug"];
  public message: ResponseErrorMessage;

  constructor (response: Omit<ResponseError, "success">) {
    super(response.message);

    this.name = "ApiError";
    this.debug = response.debug;
    this.message = response.message;
  }
}

export const callAPI = async <Api extends {
  path: string;
  request: unknown;
  response: unknown;
}>(
  path: Api["path"],
  body: Api["request"],
  options = {
    /** Prevents the response from being saved in the localForage. */
    prevent_cache: false
  }
): Promise<Api["response"]> => {
  const request = await fetch("/api" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const user = app.current_user;
  const response = await request.json() as Response<Api["response"]>;

  if (!response.success) {
    if (response.message === ResponseErrorMessage.SessionExpired) {
      // When the session expired while connected to a user
      // we try to restore the session.
      if (user.slug) {
        const old_session = user.session;

        app.setBannerMessage({
          message: AppBannerMessage.RestoringSession,
          is_loader: true
        });

        try {
          const data = await connectToPronote({
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

          if (!data) {
            throw new ApiError({
              message: ResponseErrorMessage.SessionCantRestore
            });
          }

          const is_saved = await sessions.upsert(user.slug, data.session);
          if (is_saved) {
            await endpoints.upsert<ApiUserData>(
              user.slug, "/user/data", data.endpoints["/user/data"]
            );

            await endpoints.upsert<ApiLoginInformations>(
              user.slug, "/login/informations", data.endpoints["/login/informations"]
            );
          }

          throw new ApiError({
            message: ResponseErrorMessage.NewSessionAvailable
          });
        }
        catch (error) {
          if (error instanceof ApiError) {
            if (error.message === ResponseErrorMessage.NewSessionAvailable) {
              // Ignore the session restore modal.
              app.setBannerToIdle();
              throw error;
            }
          }

          app.setBannerMessage({
            is_error: true,
            message: AppBannerMessage.NeedCredentials
          });

          app.setModal("needs_scratch_session", true);
          throw error;
        }
      }

      // Should be a first-time login.
      else {
        throw new ApiError({
          message: ResponseErrorMessage.RequestPayloadBroken
        });
      }
    }

    app.setBannerMessage({
      is_error: true,
      message: AppBannerMessage.UnknownError
    });

    throw new ApiError(response);
  }

  // When we want to store the data, we also need a slug.
  // When the response contains a session or a Pronote response, we store it.
  if (!options.prevent_cache && user.slug) {
    const typed_response = response.data as unknown as {
      session?: SessionExported;
      received?: unknown;
    };

    typed_response.session && await sessions.upsert(user.slug, typed_response.session);
    typed_response.received && await endpoints.upsert(user.slug, path, typed_response.received);
  }

  app.setBannerToIdle();
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
    const ent_cookies_response = await callAPI<ApiLoginEntCookies>("/login/ent_cookies", {
      ent_url: options.ent_url,
      credentials: forge.util.createBuffer(`${forge.util.encode64(options.username)}:${forge.util.encode64(options.password)}`)
        // My own encrypting method, inspired by Pronote developers.
        .toHex().toUpperCase().split("").reverse().join("")
    }, { prevent_cache : true });

    ent_cookies = ent_cookies_response.ent_cookies;
  }

  // When we fetch a Pronote ticket, we'll need to use the RAW given URL.
  let pronote_url = options.pronote_url;

  if (options.use_ent) {
    const ent_ticket_response = await callAPI<ApiLoginEntTicket>("/login/ent_ticket", {
      ent_url: options.ent_url,
      ent_cookies
    }, { prevent_cache : true });

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

  const informations_response = await callAPI<ApiLoginInformations>("/login/informations", {
    cookies: pronote_cookies,
    account_type,
    pronote_url,

    // If the URL is not the same, we should use it as raw.
    raw_url: options.pronote_url !== pronote_url
  }, { // Here, we prevent the cache even if we'll cache it later.
    prevent_cache : true
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

  const identify_response = await callAPI<ApiLoginIdentify>("/login/identify", {
    pronote_username,
    cookies: pronote_cookies,
    session: informations_response.session
  }, { prevent_cache : true });

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

  const challengeDecrypted = forge.util.decodeUtf8(challengeDecryptedBytes);

  /// Resolving the challenge - Part 2.
  /// Modifying the plain text by removing every second character.

  const challengeDecryptedUnscrambled = new Array(challengeDecrypted.length);
  for (let i = 0; i < challengeDecrypted.length; i += 1) {
    if (i % 2 === 0) {
      challengeDecryptedUnscrambled.push(challengeDecrypted.charAt(i));
    }
  }

  /// Resolving the challenge - Part 3.
  /// Encrypting the modified text back with AES and encoding it as hex.

  const challengeEncrypted = aes.encrypt(challengeDecryptedUnscrambled.join(""), {
    iv: aesIvBuffer,
    key: challengeAesKeyBuffer
  });

  // Send the resolved challenge.
  const authenticate_response = await callAPI<ApiLoginAuthenticate>("/login/authenticate", {
    solved_challenge: challengeEncrypted,
    session: identify_response.session,
    cookies: pronote_cookies
  }, { prevent_cache : true });

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

  const user_data_response = await callAPI<ApiUserData>("/user/data", {
    session: authenticate_response.session
  }, { // Here, we prevent the cache even if we'll cache it later.
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
  const user = app.current_user;
  if (!user.slug) return 0;

  const first_date_raw = user.endpoints["/login/informations"].donnees.General.PremierLundi.V;
  const first_date = dayjs(first_date_raw, "DD-MM-YYYY");
  const days_since_first = dayjs().diff(first_date, "days");
  const week_number = 1 + Math.round(days_since_first / 7);

  return week_number;
};

export const callUserTimetableAPI = async (week: number) => {
  const user = app.current_user;
  if (!user.slug) throw new ApiError ({
    message: ResponseErrorMessage.UserUnavailable
  });

  const endpoint: ApiUserTimetable["path"] = `/user/timetable/${week}`;
  const local_response = await endpoints.get<ApiUserTimetable>(user.slug, endpoint);
  if (local_response && local_response !== null) return local_response;

  app.setBannerMessage({
    message: AppBannerMessage.FetchingTimetable,
    is_loader: true
  });

  try {
    const data = await callAPI<ApiUserTimetable>(endpoint, {
      ressource: user.endpoints["/user/data"].donnees.ressource,
      session: user.session
    });

    return data.received;
  }
  catch (error) {
    if (error instanceof ApiError) {
      if (error.message === ResponseErrorMessage.NewSessionAvailable) {
        const user_data = await endpoints.get<ApiUserData>(user.slug, "/user/data");
        if (!user_data) throw error;

        const data = await callAPI<ApiUserTimetable>(endpoint, {
          ressource: user_data.donnees.ressource,
          session: user.session
        });

        return data.received;
      }
    }

    throw error;
  }
};

export const parseTimetableLessons = (
  lessons: ApiUserTimetable["response"]["received"]["donnees"]["ListeCours"]
) => {
  interface ParsedTimetableLesson {
    date: dayjs.Dayjs;

    name?: string;
    room?: string;
    teacher?: string;
  }

  /**
   * Lessons are stored in an array for each day.
   * So the structure is basically `dayOfWeek[lesson[]]`,
   * where `dayOfWeek` is a number and starts from 0 for Monday.
   */
  const parsed_lessons: ParsedTimetableLesson[][] = [...Array.from(Array(7), () => [])];

  for (const lesson of lessons) {
    const date = dayjs(lesson.DateDuCours.V, "DD-MM-YYYY HH:mm:ss");
    const dayOfWeek = date.day();

    const parsed_lesson: ParsedTimetableLesson = { date };

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
    parsed_lessons[dayOfWeek].push(parsed_lesson);
  }

  return parsed_lessons;
};
