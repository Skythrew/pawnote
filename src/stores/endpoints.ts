import type { ApiUserData } from "@/types/api";

import localforage from "localforage";

export interface StoredEndpoints {
  "/user/data": ApiUserData["response"]["received"];
}

const database = (slug: string) => localforage.createInstance({
  name: "endpoints",
  storeName: slug
});

const get = <Api extends { path: string, response: { received: unknown } }>(
  slug: string, endpoint: Api["path"]
) => database(slug).getItem<Api["response"]["received"]>(endpoint);

const upsert = async <Api extends { path: string, response: { received: unknown } }>(
  slug: string, endpoint: Api["path"], data: Api["response"]["received"]
) => {
  try {
    await database(slug).setItem(endpoint, data);
    return true;
  }
  catch (error) {
    console.error(`[stores:endpoints:${slug}:upsert:${endpoint}]`, error);
    return false;
  }
};

/** Removes the given slug from the database. */
const remove = <Api extends { path: string }>(
  slug: string, endpoint: Api["path"]
) => database(slug).removeItem(endpoint);

export default { get, upsert, remove };
