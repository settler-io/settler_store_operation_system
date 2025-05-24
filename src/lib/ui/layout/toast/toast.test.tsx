import { toast } from "react-toastify";
import { openErrorToast, openSuccessToast } from "./toast";

vi.mock("react-toastify", () => ({
  toast: vi.fn(),
}));

test("openSuccessToast", () => {
  openSuccessToast("success message");
  expect(toast).toHaveBeenCalledOnce();
  expect(toast).toHaveBeenCalledWith("success message");
});

test("openErrorToast", () => {
  openErrorToast("error message");
  expect(toast).toHaveBeenCalledOnce();
  expect(toast).toHaveBeenCalledWith("error message", { type: "error" });
});
