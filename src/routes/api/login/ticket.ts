import type { ApiLoginTicket } from "@/types/api";

import {
  handleServerRequest
} from "@/utils/server";

import { objectHasProperty } from "@/utils/globals";

export const POST = handleServerRequest<ApiLoginTicket["response"]>(async (req, res) => {
  const body = await req.json() as ApiLoginTicket["request"];

  if (!objectHasProperty(body, "ent_url") || !objectHasProperty(body, "cookies"))
    return res.error({
      message: "Missing 'ent_url' and/or 'cookies'.",
      debug: { received_body: body }
    }, { status: 400 });

  try {
    // [boolean, string].
    // string is Pronote URL with 'identifiant=...' if boolean is true.
    // string is error message if boolean is false.
    /*
    const [fetchStatus, fetchValue] = await fetchEnt({
      url: entUrl,
      cookies: entCookies,
      onlyEntCookies: false
    });

    if (fetchStatus) {
      res.status(200).json({
        success: true,
        pronote_url: fetchValue as string
      });
    }
    else {
      res.status(400).json({
        success: false,
        message: fetchValue as string
      });
    }
    */

    return res.success({
      pronote_url: ""
    });
  }
  catch (error) {
    console.error(error);
  }
});

