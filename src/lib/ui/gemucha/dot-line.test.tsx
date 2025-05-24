import { render } from "@testing-library/react";
import { DotLine } from "./dot-line";

test("DotLine", () => {
  // レンダリングでエラーがないことをテスト
  render(<DotLine dotColor="red" dotSize="16px" width="200px" />);
});
