import { render } from "@testing-library/react";
import { ToastContainerProvider } from "./toast-container";

vi.mock("react-toastify", () => ({
  ToastContainer: vi.fn(),
}));

test("ToastContainerProvider", () => {
  // レンダリングでエラーがないことをテスト
  render(<ToastContainerProvider />);
});
