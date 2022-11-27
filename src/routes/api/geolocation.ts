import type { PronoteApiGeolocation } from "@/types/pronote";
import type { ApiGeolocation } from "@/types/api";

import { GEOLOCATION_API_URL, HEADERS_PRONOTE } from "@/utils/constants";
import { ResponseErrorCode } from "@/types/errors";

import { handleServerRequest } from "@/utils/server";
import { objectHasProperty } from "@/utils/globals";

import haversine from "haversine-distance";
import { decode } from "html-entities";

export const POST = handleServerRequest<ApiGeolocation["response"]>(async (req, res) => {
  const body = await req.raw.json() as ApiGeolocation["request"];

  if (!objectHasProperty(body, "latitude") || !objectHasProperty(body, "longitude"))
    return res.error({
      code: ResponseErrorCode.MissingParameters,
      debug: { received_body: body }
    }, { status: 400 });

  try {
    // Build the request we're gonna send to Pronote.
    const request_body: PronoteApiGeolocation["request"] = {
      nomFonction: "geoLoc",
      lat: body.latitude.toString(),
      long: body.longitude.toString()
    };

    const response = await fetch(GEOLOCATION_API_URL, {
      method: "POST",
      headers: {
        ...HEADERS_PRONOTE,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: `data=${JSON.stringify(request_body)}`
    });

    const data = await response.json() as PronoteApiGeolocation["response"];
    const raw_results = Array.isArray(data) ? data : [];

    // Restructure the results to be more readable.
    const results: ApiGeolocation["response"] = raw_results.map(result => ({
      url: result.url,
      name: decode(result.nomEtab) // Use UTF8 instead of HTML entities encoding.
        .replace("COLLEGE", "COLLÈGE")
        .replace("LYCEE", "LYCÉE")
        .trim(), // Prevent some `\r\n` at the end of some strings.

      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.long),

      postal_code: parseInt(result.cp),

      distance: haversine(
        { latitude: body.latitude, longitude: body.longitude },
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
  }
  catch {
    return res.error({
      code: ResponseErrorCode.NetworkFail
    });
  }
});
