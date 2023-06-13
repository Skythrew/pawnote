import { Session, type SessionExported } from "@pawnote/api";
import localforage from "localforage";

const database = localforage.createInstance({
  name: "internals",
  storeName: "sessions"
});

/**
 * Gets session of the given `slug` from the local database.
 *
 * @example
 * import { sessions } from "@pawnote/client";
 *
 * // You don't have to be in a reactive scope to use the function.
 * const data = await sessions.select(slug);
 * if (!data) throw new Error("Unknown slug, not in database.");
 */
export const select = async (slug: string): Promise<SessionExported | null> => (
  await database.getItem<SessionExported>(slug)
);

/**
 * Inserts or updates if existing a session of a given slug.
 *
 * @example
 * import { sessions } from "@pawnote/client";
 *
 * // You don't have to be in a reactive scope to use the function.
 * const succeed = await sessions.upsert(slug, session);
 * if (!succeed) throw new Error(`Can't insert or update the session of ${slug}`);
 */
export const upsert = async (slug: string, session: Session | SessionExported): Promise<boolean> => {
  try {
    if (session instanceof Session) session = session.exportToObject();
    await database.setItem<SessionExported>(slug, session);

    // TODO: Do this directly inside the component.
    // const user = app.current_user;
    // if (user.slug && user.slug === slug) {
    //   app.setCurrentUser("session", session);
    // }

    return true;
  }
  catch (error) {
    console.error(`[@pawnote/client][sessions]: 'upsert("${slug}", #session#)'`, error);
    return false;
  }
};

/**
 * Removes session of the given `slug` from the local database.
 *
 * @example
 * import { sessions } from "@pawnote/client";
 *
 * // You don't have to be in a reactive scope to use the function.
 * const succeed = await sessions.remove(slug);
 * if (!succeed) throw new Error(`Can't remove the session of ${slug}`);
 */
export const remove = async (slug: string): Promise<boolean> => {
  try {
    await database.removeItem(slug);

    // TODO: Move this to a component to preserve reactivity.
    // const user = app.current_user;
    // if (user.slug && user.slug === slug) {
    //   app.cleanCurrentUser();
    // }

    return true;
  }
  catch (error) {
    console.error(`[@pawnote/client][sessions]: 'remove("${slug}")'`, error);
    return false;
  }
};

/**
 * Get every slugs in the local database.
 * Redirection to the localForage's method `.keys()`.
 *
 * @example
 * import { sessions } from "@pawnote/client";
 *
 * // We get every slugs in the local database.
 * const slugs = await sessions.keys();
 *
 * // Iterate through all the slugs.
 * for (const slug of slugs) {
 *   const user_session = await sessions.getFromDatabase(slug);
 *   if (!user_session) continue;
 *
 *   console.info(slug, user_session);
 * }
 */
export const keys = database.keys;
