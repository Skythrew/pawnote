import localforage from "localforage";

import app from "@/stores/app";

const database = (slug: string) => localforage.createInstance({
  name: "endpoints",
  storeName: slug
});

const get = async <Api extends { path: string, response: { received: unknown } }>(
  slug: string, endpoint: Api["path"]
): Promise<Api["response"]["received"] | null> => {
  const user = app.current_user;
  if (user.slug && user.slug === slug) {
    const cached_data = user.endpoints[endpoint as keyof (typeof user.endpoints)];
    if (cached_data) return cached_data;
  }

  const data = await database(slug).getItem<{
    received: Api["response"]["received"];
    /** When the endpoint was saved in millis. */
    date: number;
  }>(endpoint);

  if (data === null) return null;

  // Endpoints should be renewed every 4h
  // (TODO: Make it so the user can choose)
  const expiration = 4 * (1000 * 60 * 60);
  const is_expired = Date.now() - data.date >= expiration;
  if (is_expired) return null;

  if (user.slug && user.slug === slug) {
    app.setCurrentUser("endpoints", {
      [endpoint as keyof (typeof user.endpoints)]: data.received
    });
  }

  return data.received;
};

const upsert = async <Api extends { path: string, response: { received: unknown } }>(
  slug: string, endpoint: Api["path"], data: Api["response"]["received"]
) => {
  try {
    await database(slug).setItem(endpoint, {
      received: data,
      date: Date.now()
    });

    const user = app.current_user;
    if (user.slug && user.slug === slug) {
      app.setCurrentUser("endpoints", {
        [endpoint as keyof (typeof user.endpoints)]: data
      });
    }

    return true;
  }
  catch (error) {
    console.error(`[stores:endpoints:${slug}:upsert:${endpoint}]`, error);
    return false;
  }
};

export default { get, upsert };
