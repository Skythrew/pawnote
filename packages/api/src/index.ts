export * as handlers from "@/handlers";

// Endpoints typings
export * from "@/handlers/instance/types";
export * from "@/handlers/geolocation/types";
export * from "@/handlers/user/data/types";
export * from "@/handlers/user/grades/types";
export * from "@/handlers/user/timetable/types";
export * from "@/handlers/user/resources/types";
export * from "@/handlers/user/homeworks/types";
export * from "@/handlers/user/homework/done/types";
export * from "@/handlers/login/informations/types";
export * from "@/handlers/login/authenticate/types";
export * from "@/handlers/login/identify/types";

// Internals typings.
export type { HttpCallFunction, Response, ResponseError, ResponseSuccess } from "@/utils/requests";
export { ResponseErrorCode } from "@/utils/requests";
export * from "@/types/pronote_api";

// Utilities that can be used outside.
export { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";
export { cleanPronoteUrl } from "@/utils/requests/pronote";
export { credentials } from "@/utils/credentials";
export * from "@/utils/session";
