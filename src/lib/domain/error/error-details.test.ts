import { ApplicationError } from "@/domain/error/application-error";
import { getErrorDetails, toErrorDetails } from "@/domain/error/error-details";

describe("toErrorDetails", () => {
  const unknownError = getErrorDetails("UnknownError");

  test("primitive values", () => {
    expect(toErrorDetails(undefined)).toStrictEqual(unknownError);
    expect(toErrorDetails(null)).toStrictEqual(unknownError);
    expect(toErrorDetails(true)).toStrictEqual(unknownError);
    expect(toErrorDetails(0)).toStrictEqual(unknownError);
    expect(toErrorDetails("")).toStrictEqual(unknownError);
    expect(toErrorDetails([])).toStrictEqual(unknownError);
    expect(toErrorDetails({})).toStrictEqual(unknownError);
  });

  test("error code", () => {
    expect(toErrorDetails("InvalidUserStatus")).toStrictEqual(getErrorDetails("InvalidUserStatus"));
    expect(toErrorDetails("bad error code")).toStrictEqual(unknownError);
  });

  test("ApplicationError", () => {
    expect(toErrorDetails(new ApplicationError("InvalidUserStatus"))).toStrictEqual(
      getErrorDetails("InvalidUserStatus"),
    );
  });

  test("ErrorDetails like", () => {
    const data = { code: "code", displayMessage: "displayMessage" };
    expect(toErrorDetails(data)).toBe(data);
  });
});
