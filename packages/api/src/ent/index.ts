import { ApiResponseErrorCode, HandlerResponseError } from "@/utils/handlers/errors";
import { AvailableENT, MethodsENT } from "@/ent/types";
import { OpenENT } from "@/ent/openent";

const available_ents: AvailableENT[] = [
  OpenENT
];

export const findENT = (raw_url: string): MethodsENT => {
  let url = new URL(raw_url);

  // Workarounds for some URLs.
  switch (url.hostname) {
    case "jeunes.nouvelle-aquitaine.fr":
    case "connexion.l-educdenormandie.fr": {
      const callback = url.searchParams.get("callback") as string;
      url = new URL(callback);
    }
  }

  for (const service of Object.values(available_ents)) {
    const contains_hostname = service.hostnames.find(
      current => current === url.hostname
    );

    if (contains_hostname !== undefined) return service.methods(url);
  }

  throw new HandlerResponseError(ApiResponseErrorCode.ENTNotFound, {
    status: 400
  });
};
