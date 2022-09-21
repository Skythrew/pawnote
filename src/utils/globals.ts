/**
 * Uses the Geolocation API to get user's location
 * with longitude and latitude.
 *
 * Used with the `/api/geolocation` endpoint.
 */
export const getCurrentPosition = async (options?: PositionOptions): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  );
};
