export * as handlers from "@/handlers";

// Handlers typings.
export type { PronoteApiInstance, ApiInstance } from "@/handlers/instance/types";
export type { PronoteApiGeolocation, ApiGeolocation } from "@/handlers/geolocation/types";

// Internals typings.
export type { HttpCallFunction, Response, ResponseError, ResponseSuccess } from "@/types/internals";
export * from "@/types/pronote_api";

// Utilities that can be used outside.
export { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";
export { ResponseErrorCode } from "@/types/internals";
export { cleanPronoteUrl } from "@/utils/globals";
export { credentials } from "@/utils/credentials";
export * from "@/utils/session";
