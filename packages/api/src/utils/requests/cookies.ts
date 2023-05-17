import cookieParser from "set-cookie-parser";

export const retrieveResponseCookies = (response: Response) => {
  const cookiesFromSetCookieHeader = response.headers.get("set-cookie");
  if (!cookiesFromSetCookieHeader) return [];

  const splittedCookies = cookieParser.splitCookiesString(cookiesFromSetCookieHeader);
  const cookies = splittedCookies.map(cookie => cookie.split(";")[0]);

  return cookies;
};
