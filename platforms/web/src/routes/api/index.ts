import { handleServerRequest } from "@/utils/server";

export const GET = handleServerRequest<{
  request: Record<string, never>;
  response: {
    github: string;
  }
}>(async (_req, res) => res.success({
  github: "https://github.com/catto-labs/pawnote"
}));
