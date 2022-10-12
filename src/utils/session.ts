import type { PronoteApiSession, PronoteApiFunctionPayload } from "@/types/pronote";
import type { SessionData, SessionEncryption, SessionExported, SessionInstance } from "@/types/session";

import { aes_decrypt, aes_encrypt } from "@/utils/encryption";
import forge from "node-forge";
import pako from "pako";

class Session {
  public data: SessionData;
  public encryption: SessionEncryption;
  public instance: SessionInstance;

  constructor (
    session_data: SessionData,
    encryption_data: SessionEncryption,
    instance_data: SessionInstance
  ) {
    this.data = session_data;
    this.encryption = encryption_data;
    this.instance = instance_data;
  }

  /**
   * Exports the current session into an object
   * so it can be saved in the localForage for later usage.
   */
  exportToObject (): SessionExported {
    return { data: this.data, encryption: this.encryption, instance: this.instance };
  }

  /**
   * Takes a raw Session extracted from Pronote then parses it
   * to make it usable inside this class.
   **/
  static from_raw (session_data: PronoteApiSession, instance: SessionInstance) {
    return new Session({
      session_id: parseInt(session_data.h),
      account_type_id: session_data.a,

      skip_compression: session_data.sCoA,
      skip_encryption: session_data.sCrA,

      ent_username: session_data.e,
      ent_password: session_data.f
    }, {
      aes: {
        iv: undefined,
        key: undefined
      },

      rsa: {
        exponent: session_data.ER,
        modulus: session_data.MR
      }
    }, instance);
  }

  static create (url: string, options: { username: string, password: string, ent: boolean }) {
    console.log("// todo.", url, options);
  }

  /**
   * Check the `this.encryption.aes` object and
   * returns the buffers of `iv` and `key` for the AES encryption.
   *
   * Properties can return `undefined` when they're not
   * given in `this.encryption.aes`.
   */
  private encryption_aes () {
    const aes_iv = this.encryption.aes.iv ? forge.util.createBuffer(this.encryption.aes.iv) : undefined;
    const aes_key = this.encryption.aes.key ? forge.util.createBuffer(this.encryption.aes.key) : undefined;
    return { aes_iv, aes_key };
  }

  writePronoteFunctionPayload <Req>(data: Req) {
    this.instance.order++;

    let final_data: Req | string = data;
    const { aes_iv, aes_key } = this.encryption_aes();

    const order_encrypted = aes_encrypt(this.instance.order.toString(), {
      // Iv: encryption?.only_use_iv_to_decrypt_returned_order ? undefined : aesIv,
      iv: aes_iv,
      key: aes_key
    });

    if (!this.data.skip_compression) {
    // We get the JSON as string.
      final_data = forge.util.encodeUtf8("" + JSON.stringify(final_data));
      // We compress it using zlib, level 6, without headers.
      const deflated_data = pako.deflateRaw(forge.util.createBuffer(final_data).toHex(), { level: 6 });
      const decoder = new TextDecoder("utf8");
      final_data = decoder.decode(deflated_data);
      // We output it to HEX.
      // When encrypted, we should get the bytes from this hex.
      // When not encrypted, we send this HEX.
      final_data = forge.util.bytesToHex(final_data).toUpperCase();
    }

    if (!this.data.skip_encryption) {
      const data = !this.data.skip_compression
      // If the data has been compressed, we get the bytes
      // Of the compressed data (from HEX).
        ? forge.util.hexToBytes(final_data as string)
      // Otherwise, we get the JSON as string.
        : forge.util.encodeUtf8("" + JSON.stringify(final_data));

      const encrypted_data = aes_encrypt(data, {
        iv: aes_iv, key: aes_key
      });

      // Replace the request body with the encrypted one.
      final_data = encrypted_data;
    }

    return {
      order: order_encrypted,
      data: final_data
    };
  }

  /**
   * Returns an object when the request was successful
   * and `string` if an error has been found.
   */
  readPronoteFunctionPayload <Res>(response_body: string | null): Res | string {
    if (response_body === null) {
      this.instance.order--; // Prevent errored order.
      return "A network error happened, please retry.";
    }

    if (response_body.includes("La page a expir")) {
      this.instance.order--; // Prevent broken response to take the order.
      return "A mistake was done in the request payload, please retry.";
    }

    const response = JSON.parse(response_body) as PronoteApiFunctionPayload<Res>;
    const { aes_iv, aes_key } = this.encryption_aes();

    // Check the local order number with the received one.
    this.instance.order++;
    const decrypted_order = aes_decrypt(response.numeroOrdre, {
      iv: aes_iv, key: aes_key
    });

    if (this.instance.order !== parseInt(decrypted_order))
      return "Received and local orders aren't matching.";

    let final_data = response.donneesSec;

    if (!this.data.skip_encryption) {
      const decrypted_data = aes_decrypt(final_data as string, {
        iv: aes_iv, key: aes_key
      });

      final_data = this.data.skip_compression
        ? JSON.parse(decrypted_data)
        : forge.util.bytesToHex(decrypted_data);
    }

    if (!this.data.skip_compression) {
      const compressed = Buffer.from(final_data as string, "hex");
      final_data = pako.inflateRaw(compressed, { to: "string" });
    }

    if (typeof final_data === "string") {
      final_data = forge.util.decodeUtf8(final_data);
      final_data = JSON.parse(final_data) as Res;
    }

    return final_data;
  }
}

export default Session;
