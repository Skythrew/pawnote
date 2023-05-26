import { cleanPronoteUrl } from "@/utils/requests/pronote";
import { HttpCallFunction } from "..";
import { retrieveResponseCookies } from "@/utils/requests/cookies";
import { ApiResponseErrorCode, HandlerResponseError } from "@/utils/handlers/errors";
import { serializeError } from "serialize-error";

interface AvailableENT {
  hostnames: string[];
  methods: (url: URL) => {
    authenticate: (fetcher: HttpCallFunction, options: { username: string, password: string}) => Promise<string[]>;
    process_ticket: (fetcher: HttpCallFunction, options: { ent_cookies: string[], pronote_url: string }) => Promise<string>;
  }
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
          password: password,
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
        const { headers } = await got.get(`${url.protocol}//${url.hostname}/cas/login`, {
          maxRedirects: 1,
          followRedirect: true,
          searchParams: new URLSearchParams({
            service: cleanPronoteUrl(pronote_url) + "/" // Add trailing slash.
          }),
          headers: {
            "Cookie": ent_cookies.join("; ")
          }
        });

        return headers["location"] as string;
      }
      catch (error) {
        // If the login is successful and it redirects to the Pronote
        // ticket, get the redirected URL (for 'identifiant' parsing).
        if (error instanceof MaxRedirectsError) {
          return error.response.headers["location"] as string;
        }

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

export const findENT = (raw_url: string) => {
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

    if (contains_hostname) return service.methods(url);
  }

  throw new HandlerResponseError(ApiResponseErrorCode.ENTNotFound, {
    status: 400
  });
};
