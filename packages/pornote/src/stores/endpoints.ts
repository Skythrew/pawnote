import localforage from "localforage";
import app from "@/stores/app";

const database = (slug: string) => localforage.createInstance({
  name: "endpoints",
  storeName: slug
});

const get = async <Api extends {
  path: string,
  response: { received: unknown }
}>(
  slug: string,
  endpoint: Api["path"]
): Promise<{
  expired: boolean,
  data: Api["response"]["received"]
} | null> => {
  const user = app.current_user;
  if (user.slug && user.slug === slug) {
    const cached_data = user.endpoints[endpoint as keyof (typeof user.endpoints)];
    if (cached_data) return {
      expired: false,
      data: cached_data
    };
  }

  const data = await database(slug).getItem<{
    received: Api["response"]["received"];
    /** When the endpoint was saved in millis. */
    date: number;
  }>(endpoint);
  if (!data) return null;

  const login_informations = await database(slug).getItem<{ date: number }>("/login/informations");
  if (!login_informations) return null;

  const last_session_restore = new Date(login_informations.date);
  const last_endpoint_cache = new Date(data.date);

  const is_expired = last_endpoint_cache < last_session_restore;

  if (user.slug && user.slug === slug) {
    batch(() => {
      app.setCurrentUser("endpoints", {
        [endpoint as keyof (typeof user.endpoints)]: data.received
      });
      console.info(`[debug][endpoints.get]: cached '${endpoint}'`);
    });
  }

  return {
    expired: is_expired,
    data: data.received
  };
};

const upsert = async <Api extends { path: string, response: { received: unknown } }>(
  slug: string, endpoint: Api["path"], data: Api["response"]["received"]
) => {
  try {
    await database(slug).setItem(endpoint, {
      received: data,
      date: Date.now()
    });

    console.info(`[debug][endpoints.upsert]: stored locally '${endpoint}'`);

    const user = app.current_user;
    if (user.slug && user.slug === slug) {
      batch(() => {
        app.setCurrentUser("endpoints", {
          [endpoint as keyof (typeof user.endpoints)]: data
        });
        console.info(`[debug][endpoints.upsert]: cached '${endpoint}'`);
      });
    }

    return true;
  }
  catch (error) {
    console.error(`[debug][endpoints.upsert][${endpoint}]:`, error);
    return false;
  }
};

/** Removes every entry starting with the "match" string. */
const removeAllStartingWith = async (slug: string, match: string) => {
  const keys = await database(slug).keys();
  for (const key of keys) {
    if (key.startsWith(match)) {
      await database(slug).removeItem(key);
      console.info(`[debug][endpoints] removed '${key}'`);
    }
  }
};

export default { get, upsert, removeAllStartingWith, raw_database: database };
