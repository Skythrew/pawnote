import type { PronoteApiGeolocation } from "@/types/pronote";
import type { ApiGeolocation } from "@/types/api";

import { handleServerRequest } from "@/utils/server";
import { objectHasProperty } from "@/utils/globals";
import { decode } from "html-entities";

export const post = handleServerRequest<ApiGeolocation["response"]>(async (req, res) => {
  const body = await req.json() as ApiGeolocation["request"];

  if (!objectHasProperty(body, "latitude") || !objectHasProperty(body, "longitude"))
    return res.error({
      message: "Missing latitude and/or longitude.",
      debug: { received_body: body }
    }, { status: 400 });

  try {
    // Build the request we're gonna send to Pronote.
    const request_body: PronoteApiGeolocation["request"] = {
      nomFonction: "geoLoc",
      lat: body.latitude.toString(),
      long: body.longitude.toString()
    };

    // Fetch URL extracted from the Pronote APK.
    const response = await fetch("https://www.index-education.com/swie/geoloc.php", {
      method: "POST",
      headers: {
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
      postal_code: parseInt(result.cp)
    }));

    return res.success(results);
  }
  catch (error) {
    return res.error({
      message: "Request to Pronote failed.",
      debug: { trace: error }
    });
  }
});
