import { type ApiResponseError, ApiResponseErrorCode } from "@pawnote/api";
import { ClientErrorCode, locale } from "@pawnote/i18n";

export class ClientError extends Error {
  public debug?: unknown;
  public code: ClientErrorCode;
  public message: string;

  constructor (response: { code: ClientErrorCode, debug?: unknown }) {
    const [t] = locale;

    const error_message: string = t(`CLIENT_ERRORS.${response.code}`);

    const message = `ClientErrorCode[#${response.code}]: ${error_message}`;
    super(message);

    this.name = "ClientError";
    this.debug = response.debug;
    this.code = response.code;
    this.message = message;
  }
}

export class ApiError extends Error {
  public debug?: ApiResponseError["debug"];
  public code: ApiResponseErrorCode;
  public message: string;

  constructor (response: Omit<ApiResponseError, "success">) {
    const [t] = locale;

    const error_message: string = t(`API_ERRORS.${response.code}`);

    const message = `ResponseErrorCode[#${response.code}]: ${error_message}`;
    super(message);

    this.name = "ApiError";
    this.debug = response.debug;
    this.code = response.code;
    this.message = message;
  }
}
