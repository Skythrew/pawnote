import { json } from "solid-start/server";

export const GET = () => {
  return json({
    success: true,
    data: {
      github: "https://github.com/Vexcited/pornote",
      api_documentation: null
    }
  });
};
