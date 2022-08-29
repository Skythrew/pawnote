import { json } from "solid-start/server";

export const get = () => {
  return json({
    success: true
  });
};
