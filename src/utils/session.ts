import type { PronoteApiSession, PronoteApiFunctionPayload } from "@/types/pronote";
import type { SessionInstance, SessionEncryption, SessionExported } from "@/types/session";

import { PronoteApiAccountId } from "@/types/pronote";
import { ResponseErrorCode } from "@/types/errors";

import { aes } from "@/utils/globals";
import forge from "node-forge";
import pako from "pako";

class Session {
  public instance: SessionInstance;
  public encryption: SessionEncryption;

  constructor (
    instance_data: SessionInstance,
    encryption_data: SessionEncryption
  ) {
    this.instance = instance_data;
    this.encryption = encryption_data;
  }

  /**
   * Exports the current session into an object
   * so it can be saved in the localForage for later usage.
   */
  exportToObject (): SessionExported {
    return {
      instance: this.instance,
      encryption: this.encryption
    };
  }

  static importFromObject (session: SessionExported) {
    return new Session(
      session.instance,
      session.encryption,
    );
  }

  /**
   * Takes a raw Session extracted from Pronote then parses it
   * to make it usable inside this class.
   **/
  static from_raw (session_data: PronoteApiSession, instance: {
    pronote_url: string;
    ent_url: string | null;

    ent_cookies?: string[];
    pronote_cookies?: string[];

    use_ent: boolean;
  }) {
    let aes_iv: string | undefined = undefined;

    // Sometimes, the "a" parameter is not available in "Commun".
    if (typeof session_data.a !== "number") {
      session_data.a = PronoteApiAccountId.Commun;
    }

    // Setup IV for our session when not in "Commun".
    if (session_data.a !== PronoteApiAccountId.Commun) {
      aes_iv = forge.random.getBytesSync(16);
    }

    return new Session({
      session_id: parseInt(session_data.h),
      account_type_id: session_data.a,

      pronote_url: instance.pronote_url,
      ent_url: instance.ent_url,

      pronote_cookies: instance.pronote_cookies ?? [],
      ent_cookies: instance.ent_cookies ?? [],

      skip_compression: session_data.sCoA,
      skip_encryption: session_data.sCrA,

      order: 0,
      use_ent: instance.use_ent
    }, {
      aes: {
        iv: aes_iv,
        key: undefined
      },

      rsa: {
        exponent: session_data.ER,
        modulus: session_data.MR
      }
    });
  }

  /**
   * Check the `this.encryption.aes` object and
   * returns the buffers of `iv` and `key` for the AES encryption.
   *
   * Properties can return `undefined` when they're not
   * given in `this.encryption.aes`.
   */
  private encryption_aes () {
    // At the first order, we always take an undefined IV.
    const aes_iv = this.encryption.aes.iv && this.instance.order !== 1
      ? forge.util.createBuffer(this.encryption.aes.iv)
      : undefined;

    const aes_key = this.encryption.aes.key
      ? forge.util.createBuffer(this.encryption.aes.key)
      : undefined;

    return { aes_iv, aes_key };
  }

  writePronoteFunctionPayload <Req>(data: Req) {
    this.instance.order++;

    let final_data: Req | string = data;
    const { aes_iv, aes_key } = this.encryption_aes();

    const order_encrypted = aes.encrypt(this.instance.order.toString(), {
      iv: aes_iv,
      key: aes_key
    });

    if (!this.instance.skip_compression) {
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

    if (!this.instance.skip_encryption) {
      const data = !this.instance.skip_compression
      // If the data has been compressed, we get the bytes
      // Of the compressed data (from HEX).
        ? forge.util.hexToBytes(final_data as string)
      // Otherwise, we get the JSON as string.
        : forge.util.encodeUtf8("" + JSON.stringify(final_data));

      const encrypted_data = aes.decrypt(data, {
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
  readPronoteFunctionPayload <Res>(response_body: string): Res | ResponseErrorCode.SessionExpired | ResponseErrorCode.NotMatchingOrders {
    if (response_body.includes("La page a expir")) {
      this.instance.order--; // Prevent broken response to take the order.
      return ResponseErrorCode.SessionExpired;
    }

    this.instance.order++;

    try {
      const response = JSON.parse(response_body) as PronoteApiFunctionPayload<Res>;

      // Check the local order number with the received one.
      const { aes_iv, aes_key } = this.encryption_aes();
      const decrypted_order = aes.decrypt(response.numeroOrdre, {
        iv: aes_iv, key: aes_key
      });

      if (this.instance.order !== parseInt(decrypted_order))
        return ResponseErrorCode.NotMatchingOrders;

      let final_data = response.donneesSec;

      if (!this.instance.skip_encryption) {
        const decrypted_data = aes.decrypt(final_data as string, {
          iv: aes_iv, key: aes_key
        });

        final_data = this.instance.skip_compression
          ? JSON.parse(decrypted_data)
          : forge.util.bytesToHex(decrypted_data);
      }

      if (!this.instance.skip_compression) {
        const compressed = Buffer.from(final_data as string, "hex");
        final_data = pako.inflateRaw(compressed, { to: "string" });
      }

      if (typeof final_data === "string") {
        final_data = forge.util.decodeUtf8(final_data);
        final_data = JSON.parse(final_data) as Res;
      }

      return final_data;
    }
    catch (error) {
      console.error("[session:read...]", error);
      return ResponseErrorCode.SessionExpired;
    }
  }
}

export default Session;

