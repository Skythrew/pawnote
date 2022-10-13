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

/** Helper for classes with TailwindCSS. */
export const classNames = (...classes: (string | boolean | undefined)[]): string =>
  classes.filter(Boolean).join(" ");
