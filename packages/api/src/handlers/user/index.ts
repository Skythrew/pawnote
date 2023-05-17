import { default as data } from "./data";
export * from "./data/types";

import { default as grades } from "./grades";
export * from "./grades/types";

import { default as homeworks } from "./homeworks";
export * from "./homeworks/types";

import { default as resources } from "./resources";
export * from "./resources/types";

import { default as timetable } from "./timetable";
export * from "./timetable/types";

/** Handlers for the `/user/*` routes. */
export const user = {
  data,
  grades,
  homeworks,
  resources,
  timetable
};

export * from "./homework";
