/**
 * This is where the typing of EVERY Pronote
 * functions are located.
 *
 * Whatever API call you can do to Pronote will
 * be typed here. Of course, these typings are
 * based on the data I actually got from these
 * endpoints and requests saw in the DevTools.
 *
 * Feel free to contribute on this to add new
 * specific typings for some endpoints.
 *
 * ---
 *
 * Each endpoints have two typings:
 * - One for the request - `ApiRequest__`
 * - One for the response - `ApiResponse__`
 *
 * The response typing is wrapped with
 * the `ApiResponse<T>` type to provide
 * error handling.
 */

/** Helper type to provide error handling */
type ApiResponse<T> = T
  | {
    code: number;
    data: null;
    // TODO: Add typing for errors.
  };

