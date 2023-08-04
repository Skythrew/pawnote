import { ApiResponseErrorCode, HandlerResponseError } from "@/utils/handlers/errors";

import { getHeaderFromFetcherResponse, retrieveResponseCookies } from "@/utils/requests/headers";

import { serializeError } from "serialize-error";

import { AvailableENT } from "./types";

export const OpenENT: AvailableENT = {
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
        ticketURL.searchParams.set("service", pronote_url);

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