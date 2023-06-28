import { callAPI, type CallAPIFetcher } from "@/requests/create";
import { type ApiLoginEntCookies, PronoteApiAccountId, PRONOTE_ACCOUNT_TYPES, credentials as credentials_utility, encryption, ApiLoginEntTicket, ApiLoginInformations, ApiLoginIdentify, ApiResponseErrorCode, ApiLoginAuthenticate, ApiUserData, SessionExported } from "@pawnote/api";
import { ApiError, ClientError } from "@/utils/errors";
import { ClientErrorCode } from "@pawnote/i18n";
import forge from "node-forge";
import type { Credentials } from "@/stores/credentials";

export const guessPronoteAccountTypeFromUrl = (raw_url: string): PronoteApiAccountId => {
  const pronote_url = new URL(raw_url);
  const account_type_path = pronote_url.pathname.split("/").pop() as string;

  const result = PRONOTE_ACCOUNT_TYPES.find(
    entry => entry.path === account_type_path
  );

  if (typeof result === "undefined") {
    throw new Error(`[guessPronoteAccountTypeFromUrl]: returned \`undefined\` on url(\`${raw_url}\`)`);
  }

  return result.id;
};

export const authenticate = async (fetcher: CallAPIFetcher, options: {
  // We always need the base Pronote URL,
  // in case it has been modified.
  pronote_url: string
  device_uuid: string
  username: string
  password: string
  account_type: PronoteApiAccountId
} & (
  | { // First-time auth using only Pronote credentials.
    use_credentials: true
    use_ent: false
  }
  | { // First-time auth using ENT.
    use_credentials: true
    use_ent: true

    ent_url: string
    ent_token: string
  }
  | { // Reconnect using generated password from first-time auth.
    use_credentials: false
  }
)): Promise<{
  session: SessionExported
  endpoints: {
    "/user/data": ApiUserData["response"]["received"]
    "/login/informations": ApiLoginInformations["response"]["received"]
  }
  credentials: Credentials
}> => {
  // When first-time auth with ENT, we should get the ENT login cookies.
  let ent_cookies: string[] = [];
  if (options.use_credentials && options.use_ent) {
    const ent_cookies_response = await callAPI<ApiLoginEntCookies>(fetcher, {
      handler_id: "login.ent_cookies",
      body: {
        ent_url: options.ent_url,
        credentials: credentials_utility.encode({
          username: options.username,
          password: options.password
        })
      }
    });

    ent_cookies = ent_cookies_response.ent_cookies;
  }

  let pronote_url = new URL(options.pronote_url);
  pronote_url.pathname += `/${PRONOTE_ACCOUNT_TYPES.find(entry => entry.id === options.account_type)?.path as string}`;
  pronote_url.searchParams.set("fd", "1");

  // From the ENT cookies we got previously, we now get the ticket.
  if (options.use_credentials && options.use_ent) {
    const ent_ticket_response = await callAPI<ApiLoginEntTicket>(fetcher, {
      handler_id: "login.ent_ticket",
      body: {
        ent_url: options.ent_url,
        pronote_url: pronote_url.href,
        ent_cookies
      }
    });

    pronote_url = new URL(ent_ticket_response.pronote_url);
  }

  // Add properties to bypass ENT.
  if (options.use_credentials && !options.use_ent) {
    pronote_url.searchParams.set("bydlg", "A6ABB224-12DD-4E31-AD3E-8A39A1C2C335");
    pronote_url.searchParams.set("login", "true");
  }

  const account_type = options.use_credentials && options.use_ent
    // Guess the account type using the constants we have.
    ? guessPronoteAccountTypeFromUrl(pronote_url.href)
    // When not using ENT, just use the given account type.
    : options.account_type;

  let pronote_cookies: string[] = [];

  // When it's the first time authentication for ENT,
  // we should provide those two cookies.
  if (options.use_credentials && options.use_ent) {
    pronote_cookies = [
      `validationAppliMobile=${options.ent_token}`,
      `uuidAppliMobile=${options.device_uuid}`
    ];
  }
  // When re-authenticating we just let the app know we're just authenticating.
  else if (!options.use_credentials) {
    pronote_cookies = [
      "appliMobile=1"
    ];
  }

  // Inject the language `fr`.
  pronote_cookies.push("ielang=fr");

  const informations_response = await callAPI<ApiLoginInformations>(fetcher, {
    handler_id: "login.informations",
    body: {
      account_type,
      cookies: pronote_cookies,
      pronote_url: pronote_url.href
    }
  });

  // Update the credentials depending on the response.
  if (typeof informations_response.setup !== "undefined") {
    options.username = informations_response.setup.username;
    options.password = informations_response.setup.password;
  }

  if (options.username.length === 0 || options.password.length === 0) {
    throw new ClientError({
      code: ClientErrorCode.SessionCantRestore
    });
  }

  const identify_response = await callAPI<ApiLoginIdentify>(fetcher, {
    handler_id: "login.identify",
    body: {
      cookies: pronote_cookies,
      pronote_username: options.username,
      session: informations_response.session,
      useENT: options.use_credentials && options.use_ent,
      requestFirstMobileAuthentication: options.use_credentials,
      reuseMobileAuthentication: !options.use_credentials,
      deviceUUID: options.device_uuid
    }
  });

  if (identify_response.received.donnees.modeCompLog === 1) {
    options.username = options.username.toLowerCase();
  }

  if (identify_response.received.donnees.modeCompMdp === 1) {
    options.password = options.password.toLowerCase();
  }

  // Short-hand for later usage.
  const aesIvBuffer = forge.util.createBuffer(identify_response.session.encryption.aes.iv as string);

  /// Resolving the challenge - Part 1.
  /// Decoding the challenge from hex to bytes and decrypting it with AES.

  // Generate the hash for the AES key.
  const challengeAesKeyHash = forge.md.sha256.create()
    .update(typeof informations_response.setup !== "undefined"
      ? "" // When using generated credentials, we don't have to use `alea`.
      : identify_response.received.donnees.alea ?? ""
    )
    .update(forge.util.encodeUtf8(options.password))
    .digest();

  let challengeAesKey: string = typeof informations_response.setup === "undefined"
    ? options.username.toLowerCase()
    : ""; // When using generated credentials, we don't have to lowercase.

  challengeAesKey += challengeAesKeyHash.toHex().toUpperCase();

  const challengeAesKeyBuffer = forge.util.createBuffer(
    forge.util.encodeUtf8(challengeAesKey)
  );

  const challengeDecryptedBytes = encryption.aes.decrypt(identify_response.received.donnees.challenge, {
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
    resolved_challenge = encryption.aes.encrypt(challengeDecryptedUnscrambled.join(""), {
      iv: aesIvBuffer,
      key: challengeAesKeyBuffer
    });
  }
  catch {
    throw new ApiError({
      code: ApiResponseErrorCode.IncorrectCredentials
    });
  }

  // Send the resolved challenge.
  const authenticate_response = await callAPI<ApiLoginAuthenticate>(fetcher, {
    handler_id: "login.authenticate",
    body: {
      solved_challenge: resolved_challenge,
      session: identify_response.session,
      cookies: pronote_cookies
    }
  });

  const decryptedAuthKey = encryption.aes.decrypt(authenticate_response.received.donnees.cle, {
    iv: aesIvBuffer,
    key: challengeAesKeyBuffer
  });

  /** Get the new AES key that will be used in our requests. */
  const authKeyBytesArray = new Uint8Array(decryptedAuthKey.split(",").map(a => parseInt(a)));
  const authKey = forge.util.createBuffer(authKeyBytesArray).bytes();

  /// Update the authenticated session we previously got
  /// and let the "/user/data" endpoint do the final touches.

  authenticate_response.session.encryption.aes.key = authKey;

  const user_data_response = await callAPI<ApiUserData>(fetcher, {
    handler_id: "user.data",
    body: {
      session: authenticate_response.session
    }
  });

  /// Preparing to export datas.
  /// We export a method to directly store the data with a slug
  /// and we export also the endpoints and the session to use without saving.

  const _session: SessionExported = user_data_response.session;
  const _endpoints = {
    "/user/data": user_data_response.received,
    "/login/informations": informations_response.received
  };
  const _credentials: Credentials = {
    username: identify_response.received.donnees.login ?? options.username,
    password: authenticate_response.received.donnees.jetonConnexionAppliMobile as string
  };

  return {
    session: _session,
    endpoints: _endpoints,
    credentials: _credentials
  };
};
