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
export * from "@/handlers/login/ent_cookies/types";
export * from "@/handlers/login/ent_ticket/types";

// Internals typings.
export type { HttpCallFunction, ApiResponse, ApiResponseError, ApiResponseSuccess } from "@/utils/handlers/create";
export { ApiResponseErrorCode } from "@/utils/handlers/errors";
export type { PronoteApiAccountType, PronoteApiSession, PronoteApiFunctionPayload, PronoteApiFunctionError } from "@/utils/requests/pronote";
export { PronoteApiAccountId, PronoteApiFunctions, PronoteApiOnglets } from "@/utils/requests/pronote";

// Utilities that can be used outside.
export { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";
export { credentials } from "@/utils/credentials";
export * as encryption from "@/utils/encryption";
export * from "@/utils/session";
