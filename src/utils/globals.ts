/**
 * Helper function to get user's position
 * using Geolocation API in a Promise.
 *
 * @example
 * // Assuming the browser supports Geolocation API.
 * const { coords } = await getGeolocationPosition();
 * console.log(coords.latitude, coords.longitude);
 */
export const getGeolocationPosition = (options?: PositionOptions): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  );
};

/** Typed function to check if an object has a property. */
export const objectHasProperty = <T extends Record<string, unknown>>(obj: T, prop: keyof T) => prop in obj;

/**
 * Take any Pronote URL and return the base URL
 * of the instance.
 *
 * Note that, in the process, trailing slash **is already removed**.
 */
export const getBasePronoteUrl = (pronote_url: string) => {
  const url = new URL(pronote_url);
  // Clean any unwanted data from URL.
  const raw_url = new URL(`${url.protocol}//${url.host}${url.pathname}`);

  // Get the current paths.
  const paths = raw_url.pathname.split("/");
  const lastPath = paths[paths.length - 1];

  // Clear the last path if we're not in account type: `common` (0).
  if (lastPath.includes(".html")) {
    paths.pop();
  }

  // Rebuild the URL with cleaned paths.
  raw_url.pathname = paths.join("/");

  // Return URL without trailing slash.
  return raw_url.href.endsWith("/") ?
    raw_url.href.slice(0, -1) :
    raw_url.href;
};
