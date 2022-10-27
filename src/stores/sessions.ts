import type { SessionExported } from "@/types/session";
import Session from "@/utils/session";

import localforage from "localforage";
import app from "@/stores/app";

const database = localforage.createInstance({
  name: "internals",
  storeName: "sessions"
});

/** Returns the session of the given slug. */
const get = (slug: string) => database.getItem<SessionExported>(slug);

/** Inserts or updates the session of a given slug. */
const upsert = async (slug: string, session: Session | SessionExported) => {
  try {
    if (session instanceof Session) session = session.exportToObject();
    await database.setItem<SessionExported>(slug, session);

    const user = app.current_user;
    if (user.slug && user.slug === slug) {
      app.setCurrentUser({ session });
    }

    return true;
  }
  catch (error) {
    console.error(`[stores:sessions:upsert:${slug}]`, error);
    return false;
  }
};

/** Removes the given slug from the database. */
const remove = (slug: string) => {
  database.removeItem(slug);

  const user = app.current_user;
  if (user.slug && user.slug === slug) {
    app.cleanCurrentUser();
  }
};

export default { get, upsert, remove, keys: database.keys };
