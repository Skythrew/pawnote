import localforage from "localforage";

import app from "@/stores/app";

const database = (slug: string) => localforage.createInstance({
  name: "endpoints",
  storeName: slug
});

const get = <Api extends { path: string, response: { received: unknown } }>(
  slug: string, endpoint: Api["path"]
) => {
  const user = app.current_user;
  if (user.slug && user.slug === slug) {
    const cached_data = user.endpoints[endpoint as keyof (typeof user.endpoints)];
    if (cached_data) return cached_data as Api["response"]["received"];
  }

  return database(slug).getItem<Api["response"]["received"]>(endpoint);
};

const upsert = async <Api extends { path: string, response: { received: unknown } }>(
  slug: string, endpoint: Api["path"], data: Api["response"]["received"]
) => {
  try {
    await database(slug).setItem(endpoint, data);

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
