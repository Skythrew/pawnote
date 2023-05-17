import { default as data } from "./data";
export type * from "./data/types";

import { default as grades } from "./grades";
export type * from "./grades/types";

import { default as homeworks } from "./homeworks";
export type * from "./homeworks/types";

import { default as resources } from "./resources";
export type * from "./resources/types";

import { default as timetable } from "./timetable";
export type * from "./timetable/types";

/** Handlers for the `/user/*` routes. */
export const user = {
  data,
  grades,
  homeworks,
  resources,
  timetable
};

export * from "./homework";
