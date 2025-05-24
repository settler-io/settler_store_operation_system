import { describe } from "vitest";
import { handleServerAction } from "./handle-server-action";

vi.mock("@/ui/layout", () => ({
  openSuccessToast: vi.fn(),
  openErrorToast: vi.fn(),
}));

describe("handleServerAction", () => {
  test("successToastMessage and onSuccess", async () => {
    const { openSuccessToast, openErrorToast } = await import("@/ui/layout");

    const response = { result: { data: true } };
    const action = vi.fn().mockResolvedValue(response);
    const successToastMessage = "success message";
    const onSuccess = vi.fn();

    await handleServerAction(action(), {
      successToastMessage,
      onSuccess,
    });

    expect(openErrorToast).not.toBeCalled();
    expect(openSuccessToast).toBeCalledWith(successToastMessage);
    expect(onSuccess).toBeCalledWith(response.result);
  });

  test("onError", async () => {
    const { openSuccessToast, openErrorToast } = await import("@/ui/layout");

    const response = { error: { displayMessage: "error message" } };
    const action = vi.fn().mockResolvedValue(response);
    const onError = vi.fn();

    await handleServerAction(action(), {
      onError,
    });

    expect(openSuccessToast).not.toBeCalled();
    expect(openErrorToast).toBeCalledWith(response.error.displayMessage);
    expect(onError).toBeCalledWith(response.error);
  });
});
