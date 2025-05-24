import { redirect } from "next/navigation";
import { isRedirectError } from "./is-redirect-error";

describe("isRedirectError", () => {
  test("redirectでthrowされた場合はtrue", () => {
    let error: any = null;

    try {
      redirect("/");
    } catch (e) {
      error = e;
    }
    expect(isRedirectError(error)).toBe(true);
  });

  test("redirectでない場合はfalse", () => {
    let error: any = null;

    try {
      throw new Error("NotRedirectError");
    } catch (e) {
      error = e;
    }
    expect(isRedirectError(error)).toBe(false);
  });
});
