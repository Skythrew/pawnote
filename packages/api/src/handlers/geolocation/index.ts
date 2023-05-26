import type { PronoteApiGeolocation, ApiGeolocation } from "./types";
import { ApiGeolocationRequestSchema } from "./types";

import { createApiFunction } from "@/utils/handlers/create";
import { PRONOTE_GEOLOCATION_URL } from "@/utils/constants";

import haversine from "haversine-distance";
import { decode } from "html-entities";

/** Gives every Pronote instance in a 20km radius of the given `longitude` and `latitude`. */
export default createApiFunction<ApiGeolocation>(ApiGeolocationRequestSchema, async (req, res) => {
  const request_body: PronoteApiGeolocation["request"] = {
    nomFonction: "geoLoc",
    lat: req.body.latitude.toString(),
    long: req.body.longitude.toString()
  };

  const body = new URLSearchParams();
  body.set("data", JSON.stringify(request_body));

  const headers = new Headers();
  headers.set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");

  const response = await req.fetch(PRONOTE_GEOLOCATION_URL, {
    method: "POST",
    headers,
    body
  });

  let data = await response.json<PronoteApiGeolocation["response"]>();
  data = Array.isArray(data) ? data : [];

  // Restructure the results to be more readable.
  const results: ApiGeolocation["response"] = data.map(result => ({
    url: result.url,
    name: decode(result.nomEtab) // Use UTF8 instead of HTML entities encoding.
      .replace("COLLEGE", "COLLÈGE")
      .replace("LYCEE", "LYCÉE")
      .trim(), // Prevent some `\r\n` at the end of some strings.

    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.long),

    postal_code: parseInt(result.cp),

    distance: haversine(
      { latitude: req.body.latitude, longitude: req.body.longitude },
      { latitude: parseFloat(result.lat), longitude: parseFloat(result.long) }
    )
  }))
    // Sort the distance by the nearest and also by school's name.
    .sort((a, b) => a.distance > b.distance
      ? 1
      : a.distance < b.distance
        ? -1
        : a.name > b.name
          ? 1
          : a.name < b.name
            ? -1
            : 0
    );

  return res.success(results);
});
