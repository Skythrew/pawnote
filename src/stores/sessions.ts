import type { SessionExported } from "@/types/session";
import type Session from "@/utils/session";

import localforage from "localforage";

const database = localforage.createInstance({
  name: "pornote",
  storeName: "sessions"
});

/** Returns the session of the given slug. */
const get = (slug: string) => database.getItem<SessionExported>(slug);

/** Inserts or updates the session of a given slug. */
const upsert = async (slug: string, session: Session) => {
  try {
    const exported = session.exportToObject();
    await database.setItem<SessionExported>(slug, exported);
    return true;
  }
  catch (error) {
    console.error(`[stores:sessions:upsert:${slug}]`, error);
    return false;
  }
};

/** Removes the given slug from the database. */
const remove = (slug: string) => database.removeItem(slug);

export default { get, upsert, remove, keys: database.keys };
