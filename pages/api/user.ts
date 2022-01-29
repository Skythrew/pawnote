import type {
  NextApiRequest,
  NextApiResponse
} from "next";

import type {
  ApiUserResponse,
  ApiServerError
} from "types/ApiData";

import type {
  PronoteApiUserDataStudent
} from "types/PronoteApiData";

import getServerUrl from "@/apiUtils/getServerUrl";
import got from "got";

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiUserResponse | ApiServerError>
) {
  if (req.method === "POST") {
    /** Dirty Pronote URL. */
    const pronoteUrl: string = req.body.pronoteUrl;

    // Informations about the Pronote account path.
    const pronoteAccountId: number = req.body.pronoteAccountId;
    const pronoteSessionId: number = req.body.pronoteSessionId;

    if (!pronoteUrl || !pronoteAccountId || !pronoteSessionId) {
      res.status(400).json({
        success: false,
        message: "Missing informations about the Pronote account path."
      });
    }

    /** Cleaned Pronote URL. */
    const pronoteServerUrl = getServerUrl(pronoteUrl);

    // Creathe the API endpoint using the given session ID.
    const pronoteApiUrl = `${pronoteServerUrl}appelfonction/${pronoteAccountId}/${pronoteSessionId}`;

    const pronoteOrder: string = req.body.pronoteOrder;
    if (!pronoteOrder) {
      return res.status(400).json({
        success: false,
        message: "Missing 'pronoteOrder' for 'numeroOrdre'."
      });
    }

    const userApiUrl = `${pronoteApiUrl}/${pronoteOrder}`;
    const pronoteUserData = await got.post(userApiUrl, {
      json: {
        session: pronoteSessionId,
        numeroOrdre: pronoteOrder,
        nom: "ParametresUtilisateur",
        donneesSec: {}
      }
    }).json<
      | PronoteApiUserDataStudent
    >();

    res.status(200).json({
      success: true,
      pronoteData: pronoteUserData
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist."
    });
  }
}
