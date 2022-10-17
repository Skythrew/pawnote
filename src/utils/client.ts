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

export const connectToPronote = async (options:
  // Authenticate to Pronote directly.
  | {
    use_ticket: false;
    use_ent: false;
    use_cookies: false;

    pronote_url: string;
    username: string;
    password: string;
  }
  // Restore session with stored cookies.
  | {
    use_ticket: true;
    use_ent: false;
    use_cookies: true;

    pronote_url: string;
    cookies: string[];
  }
  // Authenticate with ENT with session cookies stored.
  | {
    use_ticket: true;
    use_ent: true;
    use_cookies: true;

    ent_url: string;
    cookies: string[];
  }
  // Authenticate with ENT without stored cookies.
  | {
    use_ticket: true;
    use_ent: true
    use_cookies: false;

    ent_url: string;
    username: string;
    password: string;
  }
) => {
  if (options.use_ticket) {

    if (options.use_ent) {
      console.info("(ENT):", options.ent_url);

      if (options.use_cookies) {
        // POST /api/login/ticket
        console.info("POST ticket", options.cookies);
      }
      else {
        // POST /api/login/ent_cookies
        console.info("POST ent_cookies", options.username, options.password);

        // Store cookies.
        const cookies: string[] = [];

        // POST /api/login/ticket
        console.info("POST ticket", cookies);
      }
    }
  }
};
