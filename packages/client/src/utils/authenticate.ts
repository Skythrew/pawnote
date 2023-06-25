import { callAPI, type CallAPIFetcher } from "@/requests/create";
import { type ApiLoginEntCookies, PronoteApiAccountId, PRONOTE_ACCOUNT_TYPES, credentials as credentials_utility, encryption, ApiLoginEntTicket, ApiLoginInformations, ApiLoginIdentify, ApiResponseErrorCode, ApiLoginAuthenticate, ApiUserData, SessionExported } from "@pawnote/api";
import { ApiError, ClientError } from "@/utils/errors";
import { ClientErrorCode } from "@pawnote/i18n";
import forge from "node-forge";

export const guessPronoteAccountTypeFromUrl = (raw_url: string): PronoteApiAccountId => {
  const pronote_url = new URL(raw_url);
  const account_type_path = pronote_url.pathname.split("/").pop();

  const result = PRONOTE_ACCOUNT_TYPES.find(
    entry => entry.path === account_type_path
  );

  if (typeof result === "undefined") {
    throw new Error(`[guessPronoteAccountTypeFromUrl]: returned \`undefined\` on url(\`${raw_url}\`)`);
  }

  return result.id;
};

export const connectToPronote = async (fetcher: CallAPIFetcher, options: {
  // We always need the base Pronote URL,
  // in case it has been modified.
  pronote_url: string
} & (
  | { // Using Pronote credentials without cookies.
    use_ent: false
    use_credentials: true

    username: string
    password: string
    account_type: PronoteApiAccountId
  }
  | { // Using ENT without cookies.
    use_ent: true
    use_credentials: true

    username: string
    password: string
    ent_url: string
  }
  | { // Using ENT with only cookies.
    use_ent: true
    use_credentials: false

    ent_cookies: string[]
    ent_url: string
  }
  | { // Using Pronote auto-reconnection with cookies.
    use_ent: false
    use_credentials: false

    pronote_cookies: string[]
    account_type: PronoteApiAccountId
  }
)): Promise<{
  session: SessionExported
  endpoints: {
    "/user/data": ApiUserData["response"]["received"]
    "/login/informations": ApiLoginInformations["response"]["received"]
  }
}> => {
  let pronote_username = !options.use_ent && options.use_credentials ? options.username : "";
  let pronote_password = !options.use_ent && options.use_credentials ? options.password : "";

  let ent_cookies: string[] = options.use_ent && !options.use_credentials
    // Use given cookies when not using credentials.
    ? options.ent_cookies
    : []; // Empty array since we gonna fetch them later.

  if (options.use_ent && options.use_credentials) {
    const ent_cookies_response = await callAPI<ApiLoginEntCookies>(fetcher, {
      handler_id: "login.ent_cookies",
      body: {
        ent_url: options.ent_url,
        credentials: credentials_utility.encode({
          username: options.username,
          password: options.password
        })
      }
    } /* { prevent_cache: true } */);

    ent_cookies = ent_cookies_response.ent_cookies;
  }

  // When we fetch a Pronote ticket, we'll need to use the RAW given URL.
  let pronote_url = options.pronote_url;

  if (options.use_ent) {
    const ent_ticket_response = await callAPI<ApiLoginEntTicket>(fetcher, {
      handler_id: "login.ent_ticket",
      body: {
        ent_url: options.ent_url,
        pronote_url,
        ent_cookies
      }
    } /* { prevent_cache: true } */);

    pronote_url = ent_ticket_response.pronote_url;
  }

  const account_type = options.use_ent
    // Guess the account type using the constants we have.
    ? guessPronoteAccountTypeFromUrl(pronote_url)
    // When not using ENT, just use the given account type.
    : options.account_type;

  let pronote_cookies: string[] = !options.use_ent && !options.use_credentials
    // Use given cookies if we're restoring a basic session.
    ? options.pronote_cookies
    : []; // We'll define some cookies for session restoring, later.

  const informations_response = await callAPI<ApiLoginInformations>(fetcher, {
    handler_id: "login.informations",
    body: {
      cookies: pronote_cookies,
      account_type,
      pronote_url,

      // If the URL is not the same, we should use it as raw.
      raw_url: options.pronote_url !== pronote_url
    }
  } /* { // Here, we prevent the cache even if we'll cache it later.
    prevent_cache: true
  } */);

  // Add cookies we got from the request.
  for (const cookie of informations_response.cookies) {
    pronote_cookies.push(cookie);
  }

  // Updating the login credentials to use depending of the received response.
  if (informations_response.setup != null) {
    pronote_username = informations_response.setup.username;
    pronote_password = informations_response.setup.password;
  }

  if (pronote_username.length === 0 || pronote_password.length === 90) {
    // TODO: Ask for new credentials.
    // User can choose if they'll be saved or not.
    // SessionFromScratchModal.show();

    throw new ClientError({
      code: ClientErrorCode.SessionCantRestore
    });
  }

  const identify_response = await callAPI<ApiLoginIdentify>(fetcher, {
    handler_id: "login.identify",
    body: {
      pronote_username,
      cookies: pronote_cookies,
      session: informations_response.session
    }
  } /* { prevent_cache: true } */);

  if (identify_response.received.donnees.modeCompLog === 1) {
    pronote_username = pronote_username.toLowerCase();
  }

  if (identify_response.received.donnees.modeCompMdp === 1) {
    pronote_password = pronote_password.toLowerCase();
  }

  // Short-hand for later usage.
  const aesIvBuffer = forge.util.createBuffer(identify_response.session.encryption.aes.iv as string);

  /// Resolving the challenge - Part 1.
  /// Decoding the challenge from hex to bytes and decrypting it with AES.

  // Generate the hash for the AES key.
  const challengeAesKeyHash = forge.md.sha256.create()
    .update((informations_response.setup != null)
      ? "" // When using generated credentials, we don't have to use `alea`.
      : identify_response.received.donnees.alea
    )
    .update(forge.util.encodeUtf8(pronote_password))
    .digest();

  let challengeAesKey: string = typeof informations_response.setup === "undefined"
    ? pronote_username.toLowerCase()
    : ""; // When using generated credentials, we don't have to lowercase.

  challengeAesKey += challengeAesKeyHash.toHex().toUpperCase() as string;

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
      solved_challenge: resolved_challenge!,
      session: identify_response.session,
      cookies: pronote_cookies
    }
  } /* { prevent_cache: true } */);

  // Remove the stored cookie "CASTJU" if exists.
  pronote_cookies = pronote_cookies.filter(cookie => !cookie.startsWith("CASTJU="));

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
  authenticate_response.session.instance.pronote_cookies = pronote_cookies;

  authenticate_response.session.instance.use_ent = options.use_ent;
  authenticate_response.session.instance.ent_cookies = ent_cookies;
  authenticate_response.session.instance.ent_url = options.use_ent ? options.ent_url : null;

  const user_data_response = await callAPI<ApiUserData>(fetcher, {
    handler_id: "user.data",
    body: {
      session: authenticate_response.session
    }
  } /* { // Here, we prevent the cache even if we'll cache it later.
    prevent_cache: true
  } */);

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
