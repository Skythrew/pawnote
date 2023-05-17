import { default as informations } from "./informations";
export * from "./informations/types";

import { default as authenticate } from "./authenticate";
export * from "./authenticate/types";

import { default as identify } from "./identify";
export * from "./identify/types";

/** Handlers for the `/login/*` routes. */
export const login = {
  informations,
  authenticate,
  identify
};
