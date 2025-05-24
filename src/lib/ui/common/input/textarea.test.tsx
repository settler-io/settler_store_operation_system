import { render } from "@testing-library/react";
import { Textarea } from "./textarea";

test("Textarea", () => {
  // レンダリングでエラーがないことをテスト
  render(<Textarea />);
  render(<Textarea label="label" />);
  render(<Textarea label="label" error="error" />);
});
