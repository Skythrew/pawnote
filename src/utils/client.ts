import type {
  Response,
  ResponseError
} from "@/types/api";

import type {
  ApiLoginAuthenticate,
  ApiLoginIdentify,
  ApiLoginInformations,
  ApiUserData
} from "@/types/api";

import { PronoteApiAccountId } from "@/types/pronote";

import { aes } from "@/utils/globals";
import Session from "@/utils/session";

import forge from "node-forge";

/** Helper class for easier error handling. */
export class ApiError extends Error {
  public debug?: ResponseError["debug"];

  constructor (response: ResponseError) {
    super(response.message);

    this.name = "ApiError";
    this.debug = response.debug;
  }
}

export const callAPI = async <Api extends {
  path: string;
  request: unknown;
  response: unknown;
}>(
  path: Api["path"],
  body: Api["request"]
): Promise<Api["response"]> => {
  const request = await fetch("/api" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const response = await request.json() as Response<Api["response"]>;
  if (!response.success) throw new ApiError(response);
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

export const connectToPronote = async (options: {
  account_type: PronoteApiAccountId;
  pronote_url: string;
  username: string;
  password: string;
}) => {
  const informations_response = await callAPI<ApiLoginInformations>("/login/informations", {
    account_type: options.account_type,
    pronote_url: options.pronote_url
  });

  let username = options.username;
  let password = options.password;

  // Updating the login credentials to use depending of the received response.
  if (informations_response.setup) {
    username = informations_response.setup.username;
    password = informations_response.setup.password;
  }

  const identify_response = await callAPI<ApiLoginIdentify>("/login/identify", {
    pronote_username: username,
    session: informations_response.session
  });

  if (identify_response.received.donnees.modeCompLog) {
    username = username.toLowerCase();
  }

  if (identify_response.received.donnees.modeCompMdp) {
    password = password.toLowerCase();
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
    .update(forge.util.encodeUtf8(password))
    .digest();

  const challengeAesKey = (informations_response.setup
    ? "" // When using generated credentials, we don't have to lowercase.
    : username.toLowerCase()
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
    session: identify_response.session
  });

  const decryptedAuthKey = aes.decrypt(authenticate_response.received.donnees.cle, {
    iv: aesIvBuffer,
    key: challengeAesKeyBuffer
  });

  /** Get the new AES key that will be used in our requests. */
  const authKeyBytesArray = new Uint8Array(decryptedAuthKey.split(",").map(a => parseInt(a)));
  const authKey = forge.util.createBuffer(authKeyBytesArray).bytes();

  // Update our authenticated session.
  let session = Session.importFromObject(authenticate_response.session);
  session.encryption.aes.key = authKey;

  const user_data_response = await callAPI<ApiUserData>("/user/data", {
    session: session.exportToObject()
  });

  session = Session.importFromObject(user_data_response.session);

};
