import got, { MaxRedirectsError } from "got";

interface AvailableENT {
  hostnames: string[];
  methods: (url: URL) => {
    authenticate: (options: { username: string, password: string}) => Promise<string[] | null>;
    process_ticket: (options: { ent_cookies: string[] }) => Promise<string | null>;
  }
}

const OpenENT: AvailableENT = {
  hostnames: [
    "mon.lyceeconnecte.fr"
  ],

  methods: (url) => ({
    async authenticate ({ username, password }) {
      try {
        // Send a POST request to `/auth/login` to get the login cookies.
        const { headers } = await got.post(`${url.protocol}//${url.hostname}/auth/login`, {
          followRedirect: false,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            email: username,
            password: password,
            rememberMe: "true"
          }).toString()
        });

        // Grab the cookies sent and parse them.
        const raw_cookies = headers["set-cookie"] || [];
        const cookies = raw_cookies.map(cookie => cookie.split(";")[0]);

        return cookies;
      }
      catch (error) {
        console.error(error);
        return null;
      }
    },

    async process_ticket ({ ent_cookies }) {
      try {
        const callbackParam = url.searchParams.get("callback") as string;
        const callbackValue = decodeURIComponent(callbackParam);
        const service = callbackValue.substring(callbackValue.indexOf("=") + 1);

        const { headers } = await got.get(`${url.protocol}//${url.hostname}/cas/login`, {
          maxRedirects: 1,
          followRedirect: true,
          searchParams: { service },
          headers: { "Cookie": ent_cookies.join("; ") }
        });

        return headers["location"] as string;
      }
      catch (error) {
        // If the login is successful and it redirects to the Pronote
        // ticket, get the redirected URL (for 'identifiant' parsing).
        if (error instanceof MaxRedirectsError) {
          return error.response.headers["location"] as string;
        }

        return null;
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
  if (url.hostname === "jeunes.nouvelle-aquitaine.fr") {
    const callback = url.searchParams.get("callback") as string;
    url = new URL(callback);
  }

  for (const service of Object.values(available_ents)) {
    const contains_hostname = service.hostnames.find(
      current => current === url.hostname
    );

    if (contains_hostname) return service.methods(url);
  }

  return null;
};
