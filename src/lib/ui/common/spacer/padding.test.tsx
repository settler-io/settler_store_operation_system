import { render } from "@testing-library/react";
import { Padding } from "./padding";

test("Padding", () => {
  // レンダリングでエラーがないことをテスト
  render(<Padding />);
  render(<Padding size="16px" />);
});
