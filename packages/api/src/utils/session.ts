import { serializeError } from "serialize-error";
import forge from "node-forge";
import pako from "pako";
import { z } from "zod";

import { PronoteApiAccountId, type PronoteApiSession, type PronoteApiFunctionPayload } from "@/utils/requests/pronote";
import { ApiResponseErrorCode, HandlerResponseError } from "@/utils/handlers/errors";
import { aes } from "@/utils/encryption";

export const SessionInstanceSchema = z.object({
  pronote_url: z.string(),
  pronote_username: z.string(),

  session_id: z.number(),
  account_type_id: z.nativeEnum(PronoteApiAccountId),

  skip_encryption: z.boolean(),
  skip_compression: z.boolean(),

  device_uuid: z.string(),
  order: z.number()
});

export type SessionInstance = z.infer<typeof SessionInstanceSchema>;

export const SessionEncryptionSchema = z.object({
  aes: z.object({
    iv: z.optional(z.string()),
    key: z.optional(z.string())
  }),

  rsa: z.object({
    modulus: z.string(),
    exponent: z.string()
  })
});

export type SessionEncryption = z.infer<typeof SessionEncryptionSchema>;

export const SessionExportedSchema = z.object({
  instance: SessionInstanceSchema,
  encryption: SessionEncryptionSchema
});

export type SessionExported = z.infer<typeof SessionExportedSchema>;

export class Session {
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

  static importFromObject (session: SessionExported): Session {
    return new Session(
      session.instance,
      session.encryption
    );
  }

  /**
   * Takes a raw session extracted from the Pronote page and then parses it.
   *
   * Should only be used inside `/login/informations` API endpoint,
   * that's why we provide an empty string for `pronote_username` and `device_uuid` for now.
   * They should be filled automatically in the next request, `/login/identify`.
   */
  static from_raw (session_data: PronoteApiSession, instance: {
    pronote_url: string
  }): Session {
    let aes_iv: string | undefined;

    // `a` parameter is not available in `Commun`.
    if (typeof session_data.a !== "number") {
      session_data.a = PronoteApiAccountId.Commun;
    }

    // We have to setup IV for our session when we're not in `Commun`.
    if (session_data.a !== PronoteApiAccountId.Commun) {
      aes_iv = forge.random.getBytesSync(16);
    }

    return new Session({
      session_id: parseInt(session_data.h),
      account_type_id: session_data.a,

      pronote_url: instance.pronote_url,

      skip_compression: session_data.sCoA,
      skip_encryption: session_data.sCrA,

      order: 0,

      // Should be filled manually in the `/login/identify` handler.
      pronote_username: "",
      device_uuid: ""
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
  private encryption_aes (): { aes_iv?: forge.util.ByteStringBuffer, aes_key?: forge.util.ByteStringBuffer } {
    // At the first order, we always take an undefined IV.
    const aes_iv = this.encryption.aes.iv !== undefined && this.instance.order !== 1
      ? forge.util.createBuffer(this.encryption.aes.iv)
      : undefined;

    const aes_key = this.encryption.aes.key !== undefined
      ? forge.util.createBuffer(this.encryption.aes.key)
      : undefined;

    return { aes_iv, aes_key };
  }

  writePronoteFunctionPayload <Req>(data: Req): { order: string, data: Req | string } {
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
  readPronoteFunctionPayload <Res>(response_body: string): Res {
    if (response_body.includes("La page a expir")) {
      throw new HandlerResponseError(
        ApiResponseErrorCode.SessionExpired, { status: 401 }
      );
    }

    if (response_body.includes("Votre adresse IP est provisoirement suspendue")) {
      throw new HandlerResponseError(
        ApiResponseErrorCode.PronoteBannedIP, { status: 401 }
      );
    }

    if (response_body.includes("La page demandée n'existe pas")) {
      throw new HandlerResponseError(
        ApiResponseErrorCode.PronoteClosedInstance, { status: 404 }
      );
    }

    this.instance.order++;
    const response = JSON.parse(response_body) as PronoteApiFunctionPayload<Res>;

    try {
      // Check the local order number with the received one.
      const { aes_iv, aes_key } = this.encryption_aes();
      const decrypted_order = aes.decrypt(response.numeroOrdre, {
        iv: aes_iv, key: aes_key
      });

      if (this.instance.order !== parseInt(decrypted_order)) {
        throw new HandlerResponseError(
          ApiResponseErrorCode.NotMatchingOrders, { status: 400 }
        );
      }

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
      throw new HandlerResponseError(ApiResponseErrorCode.ResponsePayloadBroken, {
        debug: {
          error: serializeError(error),
          response
        }
      });
    }
  }
}
