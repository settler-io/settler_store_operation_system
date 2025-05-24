import { render } from "@testing-library/react";
import { HLine } from "./h-line";

test("HLine", () => {
  // レンダリングでエラーがないことをテスト
  render(<HLine startColor="red" endColor="while" />);
});
