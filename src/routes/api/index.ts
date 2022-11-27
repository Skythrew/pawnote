import { json } from "solid-start/api";

export const GET = () => {
  return json ({
    success: true,
    data: {
      github: "https://github.com/Vexcited/pornote",
      api_documentation: "https://github.com/Vexcited/pornote/blob/main/docs/api.md"
    }
  });
};
