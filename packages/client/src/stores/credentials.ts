import { credentials } from "@pawnote/api";
import localforage from "localforage";

const database = localforage.createInstance({
  name: "internals",
  storeName: "credentials"
});

/**
 * Gets the credentials of the given `slug` from the local database.
 *
 * @example
 * import { credentials } from "@pawnote/client";
 *
 * // You don't have to be in a reactive scope to use the function.
 * const user_credentials = await credentials.select(slug);
 * if (!user_credentials) throw new Error("Unknown slug, not in database.");
 * const { username, password } = user_credentials;
 */
export const select = async (slug: string) => {
  const encoded_credentials = await database.getItem<string>(slug);
  if (!encoded_credentials) return null;

  const decoded_credentials = credentials.decode(encoded_credentials);
  return decoded_credentials;
};

/**
 * Inserts or updates if existing the credentials of a given slug.
 *
 * @example
 * import { credentials } from "@pawnote/client";
 *
 * // You don't have to be in a reactive scope to use the function.
 * const succeed = await credentials.upsert(slug, { username, password });
 * if (!succeed) throw new Error(`Can't insert or update the credentials of ${slug}`);
 */
export const upsert = async (slug: string, decoded_credentials: {
  username: string;
  password: string;
}) => {
  try {
    const encoded_credentials = credentials.encode(decoded_credentials);
    await database.setItem<string>(slug, encoded_credentials);

    return true;
  }
  catch (error) {
    console.error(`[@pawnote/client][credentials]: 'upsert("${slug}", #credentials#)'`, error);
    return false;
  }
};

/**
 * Removes the credentials of the given `slug` from the local database.
 *
 * @example
 * import { credentials } from "@pawnote/client";
 *
 * // You don't have to be in a reactive scope to use the function.
 * const succeed = await credentials.remove(slug);
 * if (!succeed) throw new Error(`Can't remove the credentials of ${slug}`);
 */
export const remove = async (slug: string) => {
  try {
    await database.removeItem(slug);
    return true;
  }
  catch (error) {
    console.error(`[@pawnote/client][credentials]: 'remove("${slug}")'`, error);
    return false;
  }
};
