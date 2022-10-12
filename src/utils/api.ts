/**
 * Here, we will write functions to call
 * the Pornote API and then exporting them
 * with typings and cool names so we can
 * easily find them later !
 *
 * Naming convention for these functions:
 * - "apiMethodPathInCamelCase"
 * - eg.: "apiPostGeolocation"; "apiGetAccountProfile"
 *
 * ---
 *
 * Every function is asynchronous and have a "body" parameter
 * that is the request body of the function.
 *
 * @example - Using async/await
 * const data = await apiPostGeolocation({ ... })
 *  .catch(err => console.error(err));
 */

import type {
  Response,
  ResponseError,

  ApiGeolocation,
  ApiInstance
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

export const apiPostGeolocation = async (
  body: ApiGeolocation["request"]
): Promise<ApiGeolocation["response"]> => {
  const request = await fetch("/api/geolocation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const response = await request.json() as Response<ApiGeolocation["response"]>;
  if (!response.success) throw new ApiError(response);
  return response.data;
};

export const apiPostInstance = async (
  body: ApiInstance["request"]
): Promise<ApiInstance["response"]> => {
  const request = await fetch("/api/instance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const response = await request.json() as Response<ApiInstance["response"]>;
  if (!response.success) throw new ApiError(response);
  return response.data;
};
