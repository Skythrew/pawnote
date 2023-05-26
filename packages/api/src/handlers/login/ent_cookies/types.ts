import { z } from "zod";

export const ApiLoginEntCookiesRequestSchema = z.object({
  ent_url: z.string(),
  credentials: z.string()
});

export interface ApiLoginEntCookies {
  request: z.infer<typeof ApiLoginEntCookiesRequestSchema>

  response: {
    ent_cookies: string[];
  }

  path: "/login/ent_cookies";
}
