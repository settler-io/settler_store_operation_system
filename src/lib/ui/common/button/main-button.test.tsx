import { render } from "@testing-library/react";
import { MainButton } from "./main-button";

test("AlertButton", () => {
  // レンダリングでエラーがないことをテスト
  render(<MainButton>Button</MainButton>);
});
