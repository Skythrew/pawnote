import { handleServerRequest } from "@/utils/server";

export const GET = handleServerRequest<{
  request: Record<string, never>;
  response: {
    github: string;
    api_documentation: string;
  }
}>(async (_req, res) => res.success({
  github: "https://github.com/Vexcited/pornote",
  api_documentation: "https://github.com/Vexcited/pornote/blob/main/docs/api.md"
}));

