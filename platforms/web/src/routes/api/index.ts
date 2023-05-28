import { handleServerRequest } from "@/utils/server";
import version from "@/utils/version";

export const GET = handleServerRequest<{
  request: Record<string, never>;
  response: {
    version: string;
    github: string;
  }
}>(async (_req, res) => res.success({
  version: version(),
  github: "https://github.com/catto-labs/pawnote"
}));
