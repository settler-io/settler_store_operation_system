import { ApplicationError } from "./application-error";
import { ERRORS, type ErrorCode, type ErrorDetails } from "./errors";

function isObject(v: unknown): v is object {
  return !!v && typeof v === "object";
}

function isErrorCode(code: unknown): code is ErrorCode {
  return typeof code === "string" && code in ERRORS;
}

function isErrorDetailsLike(e: unknown): e is ErrorDetails {
  return isObject(e) && "code" in e && "displayMessage" in e;
}

export function getErrorDetails(code: ErrorCode): ErrorDetails {
  return {
    code,
    ...ERRORS[code],
  };
}

export function toErrorDetails(e: unknown): ErrorDetails {
  if (isErrorCode(e)) {
    return getErrorDetails(e);
  }
  if (e instanceof ApplicationError) {
    return {
      code: e.code,
      displayMessage: e.displayMessage,
    } as ErrorDetails;
  }
  if (isErrorDetailsLike(e)) {
    return e;
  }

  return getErrorDetails("UnknownError");
}
