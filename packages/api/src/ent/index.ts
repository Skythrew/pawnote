import type { HttpCallFunction } from "@/utils/handlers/create";
import { ApiResponseErrorCode, HandlerResponseError } from "@/utils/handlers/errors";

import { cleanPronoteUrl } from "@/utils/requests/pronote";
import { getHeaderFromFetcherResponse, retrieveResponseCookies } from "@/utils/requests/headers";

import { serializeError } from "serialize-error";

interface MethodsENT {
  authenticate: (fetcher: HttpCallFunction, options: { username: string, password: string }) => Promise<string[]>
  process_ticket: (fetcher: HttpCallFunction, options: { ent_cookies: string[], pronote_url: string }) => Promise<string>
}

interface AvailableENT {
  hostnames: string[]
  methods: (url: URL) => MethodsENT
}

const OpenENT: AvailableENT = {
  hostnames: [
    "enthdf.fr",
    "mon.lyceeconnecte.fr",
    "ent.l-educdenormandie.fr"
  ],

  methods: (url) => ({
    async authenticate (fetcher, { username, password }) {
      try {
        const headers = new Headers();
        headers.set("Content-Type", "application/x-www-form-urlencoded");

        const body = new URLSearchParams({
          email: username,
          password,
          rememberMe: "true"
        }).toString();

        const response = await fetcher(`${url.protocol}//${url.hostname}/auth/login`, {
          method: "POST",
          redirect: "manual",
          headers,
          body
        });

        const raw_cookies = retrieveResponseCookies(response.headers);
        const cookies = raw_cookies.map(cookie => cookie.split(";")[0]);

        return cookies;
      }
      catch (error) {
        throw new HandlerResponseError(ApiResponseErrorCode.ENTCookiesFetch, {
          status: 500,
          debug: { error: serializeError(error) }
        });
      }
    },

    async process_ticket (fetcher, { ent_cookies, pronote_url }) {
      try {
        const ticketURL = new URL(`${url.protocol}//${url.hostname}/cas/login`);
        // We don't forget to put a trailing slash, **very important**.
        ticketURL.searchParams.set("service", cleanPronoteUrl(pronote_url) + "/");

        const ticketHeaders = new Headers();
        ticketHeaders.set("cookie", ent_cookies.join("; "));

        const ticketResponse = await fetcher(ticketURL.href, {
          method: "GET",
          redirect: "manual",
          headers: ticketHeaders
        });

        const processTicketURL = getHeaderFromFetcherResponse(ticketResponse.headers, "location");
        if (processTicketURL === null) {
          throw new HandlerResponseError(ApiResponseErrorCode.PronoteTicketFetch, {
            status: 500,
            debug: {
              message: "`location` header not found on `ticketResponse`.",
              response_headers: ticketResponse.headers
            }
          });
        }

        const processTicketResponse = await fetcher(processTicketURL, {
          method: "GET",
          redirect: "manual"
        });

        const pronoteURL = getHeaderFromFetcherResponse(processTicketResponse.headers, "location");
        if (pronoteURL === null) {
          throw new HandlerResponseError(ApiResponseErrorCode.PronoteTicketFetch, {
            status: 500,
            debug: {
              message: "`location` header not found on `processTicketResponse`.",
              response_headers: processTicketResponse.headers
            }
          });
        }

        return pronoteURL;
      }
      catch (error) {
        throw new HandlerResponseError(ApiResponseErrorCode.PronoteTicketFetch, {
          status: 500,
          debug: { error: serializeError(error) }
        });
      }
    }
  })
};

const available_ents: AvailableENT[] = [
  OpenENT
];

export const findENT = (raw_url: string): MethodsENT => {
  let url = new URL(raw_url);

  // Workarounds for some URLs.
  switch (url.hostname) {
  case "jeunes.nouvelle-aquitaine.fr":
  case "connexion.l-educdenormandie.fr": {
    const callback = url.searchParams.get("callback") as string;
    url = new URL(callback);
  }
  }

  for (const service of Object.values(available_ents)) {
    const contains_hostname = service.hostnames.find(
      current => current === url.hostname
    );

    if (contains_hostname !== undefined) return service.methods(url);
  }

  throw new HandlerResponseError(ApiResponseErrorCode.ENTNotFound, {
    status: 400
  });
};
