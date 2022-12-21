import forge from "node-forge";

/** Typed function to check if an object has a property. */
export const objectHasProperty = <T extends Record<string, unknown>>(obj: T, prop: keyof T) => prop in obj;

/**
 * Generates a MD5 ByteBuffer from another ByteBuffer.
 * @param buffer - ByteBuffer to convert to MD5.
 * @returns A new ByteBuffer in MD5.
 */
export const md5 = (buffer: forge.util.ByteStringBuffer) =>
  forge.md.md5.create().update(buffer.bytes()).digest();

export const aes = {
  decrypt (data: string, {
    key = forge.util.createBuffer(),
    iv
  }: {
    key?: forge.util.ByteStringBuffer;
    iv?: forge.util.ByteStringBuffer;
  }) {
    // IV => Generate a MD5 ByteBuffer from current IV.
    if (iv && iv.length()) iv = md5(iv);
    // No IV => Create an empty buffer of 16 bytes.
    else iv = forge.util.createBuffer().fillWithByte(0, 16);

    // Get the buffer.
    const dataInBytes = forge.util.hexToBytes(data);
    const dataBuffer = forge.util.createBuffer(dataInBytes);

    // Start the decryption using 'AES-CBC' method.
    const decipher = forge.cipher.createDecipher("AES-CBC", md5(key));
    decipher.start({ iv });
    decipher.update(dataBuffer);
    decipher.finish();

    // Return the decrypted value.
    return decipher.output.bytes();
  },

  encrypt (data: string, {
    key = forge.util.createBuffer(),
    iv
  }: {
    key?: forge.util.ByteStringBuffer;
    iv?: forge.util.ByteStringBuffer;
  }) {
    /**
     * Create cipher using 'AES-CBC' method and
     * use an MD5 ByteBuffer of the given 'key'.
     */
    const cipher = forge.cipher.createCipher("AES-CBC", md5(key));

    // IV => Generate a MD5 ByteBuffer from current IV.
    if (iv && iv.length()) iv = md5(iv);
    // No IV => Create an empty buffer of 16 bytes.
    else iv = forge.util.createBuffer().fillWithByte(0, 16);

    // We need to encrypt `data` (UTF-8).
    const bufferToEncrypt = forge.util.createBuffer(data, "utf8");

    // Start the encryption.
    cipher.start({ iv });
    cipher.update(bufferToEncrypt);
    cipher.finish();

    // Return the encrypted buffer in HEX.
    return cipher.output.toHex();
  }
};

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

export const credentials = {
  encode (options: {
    username: string;
    password: string;
  }) {
    return forge.util.createBuffer(`${forge.util.encode64(options.username)}:${forge.util.encode64(options.password)}`)
    // My own encrypting method, inspired by Pronote developers.
      .toHex().toUpperCase().split("").reverse().join("");
  },

  decode (credentials: string) {
    const result = forge.util.encodeUtf8(
      forge.util.hexToBytes(
        credentials.split("").reverse().join("")
      )
    ).split(":").map(str => forge.util.decode64(str));

    return {
      username: result[0],
      password: result[1]
    };
  }
};

export const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
