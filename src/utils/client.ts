import type {
  Response,
  ResponseError
} from "@/types/api";

/** Helper class for easier error handling. */
export class ApiError extends Error {
  public debug?: ResponseError["debug"];

  constructor (response: ResponseError) {
    super(response.message);

    this.name = "ApiError";
    this.debug = response.debug;
  }
}

export const callAPI = async <Api extends {
  path: string;
  request: unknown;
  response: unknown;
}>(
  path: Api["path"],
  body: Api["request"]
): Promise<Api["response"]> => {
  const request = await fetch("/api" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const response = await request.json() as Response<Api["response"]>;
  if (!response.success) throw new ApiError(response);
  return response.data;
};

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

/** Helper for classes with TailwindCSS. */
export const classNames = (...classes: (string | boolean | undefined)[]): string =>
  classes.filter(Boolean).join(" ");
