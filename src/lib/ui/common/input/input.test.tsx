import { render } from "@testing-library/react";
import { Input } from "./input";

test("Input", () => {
  // レンダリングでエラーがないことをテスト
  render(<Input />);
  render(<Input label="label" />);
  render(<Input label="label" error="error" />);
});
