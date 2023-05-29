import { z } from "zod";

export const ApiGeolocationRequestSchema = z.object({
  latitude: z.number(),
  longitude: z.number()
});

export interface PronoteApiGeolocation {
  request: {
    nomFonction: "geoLoc"
    lat: string
    long: string
  }

  response: Array<{
    url: string
    nomEtab: string
    lat: string
    long: string
    cp: string
  }> | Record<string, unknown> // `{}` when no results.
}

export interface ApiGeolocation {
  request: z.infer<typeof ApiGeolocationRequestSchema>

  response: Array<{
    url: string
    name: string
    latitude: number
    longitude: number
    postal_code: number
    /** Distance in meters. */
    distance: number
  }>

  path: "/geolocation"
}
