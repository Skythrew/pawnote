import type { ApiUserData } from "@/types/api";

import localforage from "localforage";

const database = localforage.createInstance({
  name: "pornote",
  storeName: "endpoints"
});

export interface StoredEndpoints {
  "/user/data": ApiUserData["response"]["received"];
}

const get = <Api extends { path: string, response: { received: unknown } }>(
  slug: string, endpoint: Api["path"]
) => database.getItem<Api["response"]["received"]>(
  // A table looks like this: "slug-endpoint",
  // so for example, "student-/user/data" will contain
  // `ApiUserData["response"]["received"]` for slug `student`.
  `${slug}-${endpoint}`
);

const upsert = async <Api extends { path: string, response: { received: unknown } }>(
  slug: string, endpoint: Api["path"], data: Api["response"]["received"]
) => {
  try {
    await database.setItem(`${slug}-${endpoint}`, data);
    return true;
  }
  catch (error) {
    console.error(`[stores:endpoints:upsert:${slug}-${endpoint}]`, error);
    return false;
  }
};

/** Removes the given slug from the database. */
const remove = <Api extends { path: string }>(
  slug: string, endpoint: Api["path"]
) => database.removeItem(`${slug}-${endpoint}`);

export default { get, upsert, remove };
