import { ERRORS, type ErrorCode } from "./errors";

export class ApplicationError extends Error {
  readonly code: string;
  readonly displayMessage: string;

  constructor(code: ErrorCode, options?: ErrorOptions) {
    super(code, options);
    this.code = code;
    this.displayMessage = ERRORS[code].displayMessage;
  }
}

export function throwApplicationError(code: ErrorCode): never {
  throw new ApplicationError(code);
}
