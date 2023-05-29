import { z } from "zod";

export const ApiLoginEntTicketRequestSchema = z.object({
  ent_url: z.string(),
  pronote_url: z.string(),
  ent_cookies: z.array(z.string())
});

export interface ApiLoginEntTicket {
  request: z.infer<typeof ApiLoginEntTicketRequestSchema>

  response: {
    /** New URL with "?identifiant=XXXX" parameter. */
    pronote_url: string
  }

  path: "/login/ent_ticket"
}
