import { z } from "zod";
import { throwApplicationError } from "./application-error";
import type { ErrorCode } from "./errors";

export function parse<S extends z.ZodType<any, any, any>>(
  schema: S,
  value: unknown,
  errorCode: ErrorCode,
): z.output<S> {
  const res = schema.safeParse(value);
  if (res.success) {
    return res.data;
  } else {
    throwApplicationError(errorCode);
  }
}
