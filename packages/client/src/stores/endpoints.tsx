import localforage from "localforage";
import { useUser } from "@/contexts/app";

import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";

/**
 * We create a cache to prevent running `createInstance` each time
 * we want to access an instance.
 */
const cachedDatabaseInstances: { [slug: string]: LocalForage } = {};

/**
 * Get the local database instance of a given slug.
 * We can select the database instance to use depending on the slug.
 *
 * Each slug have its own local database instance, to prevent conflicts
 * and to have a better organisation.
 */
export const fromDatabase = (slug: string) => {
  // If the instance wasn't created, we have to create and store it in cache.
  if (!cachedDatabaseInstances[slug]) {
    cachedDatabaseInstances[slug] = localforage.createInstance({
      name: "endpoints",
      storeName: slug
    });
  }

  // Return the instance cached.
  return cachedDatabaseInstances[slug];
};

/**
 * Gets a stored endpoint entry of the given `slug` from the local database.
 *
 * When the endpoint wasn't cached in the app store,
 * we also do it at the same time.
 *
 * When the endpoint was actually cached in the app store, we just return the
 * data from the app store and not the local database to prevent doing useless calls.
 *
 * @example
 * import type { ApiEndpointPathType } from "@pawnote/api";
 * import { endpoints } from "@pawnote/client";
 *
 * // You don't have to be in a reactive scope to use the function.
 * const data = await endpoints.select<ApiEndpointPathType>(slug, endpoint_path);
 * if (!data) {
 *   // Write something to fetch that endpoint
 *   // and then store it using the `upsert` method.
 * }
 */
export const select = async <Api extends {
  path: string,
  response: { received: unknown }
}>(
  slug: string,
  endpoint: Api["path"]
): Promise<{
  expired: boolean,
  data: Api["response"]["received"]
} | null> => {
  const database = fromDatabase(slug);

  // const user = app.current_user;
  // if (user.slug && user.slug === slug) {
  //   const cached_data = user.endpoints[endpoint as keyof (typeof user.endpoints)];
  //   if (cached_data) return {
  //     expired: false,
  //     data: cached_data
  //   };
  // }

  const data = await database.getItem<{
    received: Api["response"]["received"];
    /** When the endpoint was saved in millis. */
    date: number;
  }>(endpoint);
  if (!data) return null;

  const login_informations = await database.getItem<{ date: number }>("/login/informations");
  if (!login_informations) return null;

  const last_session_restore = new Date(login_informations.date);
  const last_endpoint_cache = new Date(data.date);

  const is_expired = last_endpoint_cache < last_session_restore;

  // if (user.slug && user.slug === slug) {
  //   batch(() => {
  //     app.setCurrentUser("endpoints", {
  //       [endpoint as keyof (typeof user.endpoints)]: data.received
  //     });
  //     console.info(`[debug][endpoints.get]: cached '${endpoint}'`);
  //   });
  // }

  return {
    expired: is_expired,
    data: data.received
  };
};

export const upsert = async <Api extends { path: string, response: { received: unknown } }>(
  slug: string, endpoint: Api["path"], data: Api["response"]["received"]
) => {
  try {
    await fromDatabase(slug).setItem(endpoint, {
      received: data,
      date: Date.now()
    });

    console.info(`[debug][endpoints.upsert]: stored locally '${endpoint}'`);

    // const user = app.current_user;
    // if (user.slug && user.slug === slug) {
    //   batch(() => {
    //     app.setCurrentUser("endpoints", {
    //       [endpoint as keyof (typeof user.endpoints)]: data
    //     });
    //     console.info(`[debug][endpoints.upsert]: cached '${endpoint}'`);
    //   });
    // }

    return true;
  }
  catch (error) {
    console.error(`[debug][endpoints.upsert][${endpoint}]:`, error);
    return false;
  }
};

/**
 * Removes every entries from a local endpoints database
 * starting with the `searchString` string.
 */
export const removeAllStartingWith = async (slug: string, searchString: string) => {
  const database = fromDatabase(slug);
  const keys = await database.keys();

  for (const key of keys) {
    if (!key.startsWith(searchString)) continue;
    await database.removeItem(key);
  }
};

export const useEndpoint = <Api extends {
  path: string,
  response: { received: unknown }
}>(endpoint: Api["path"], fetcher: () => Promise<Api["response"]>) => {
  const [user, { mutate }] = useUser();
  const navigate = useNavigate();

  if (!user.slug) {
    navigate("/app/");
    return;
  }

  const refetch = async () => {
    if (!navigator.onLine) {
      console.error("[@pawnote/client][endpoints]: cannot refetch, no internet connection.");
      return;
    }

    const data = await fetcher();
    mutate("endpoints", { [endpoint]: data });
  };

  const getter = () => user.slug ? user.endpoints[endpoint] ?? null : null;

  onMount(() => {
    if (!user.slug) return;
    if (!getter()) return;

    refetch();
  });

  return [getter, refetch] as const;
};
