/**
 * Helper function to get user's position
 * using Geolocation API in a Promise.
 *
 * @example
 * // Assuming the browser supports Geolocation API.
 * const { coords } = await getGeolocationPosition();
 * console.log(coords.latitude, coords.longitude);
 */
export const getGeolocationPosition = async (options?: PositionOptions): Promise<GeolocationPosition> => {
  return await new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  );
};
