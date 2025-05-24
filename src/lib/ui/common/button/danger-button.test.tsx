import { render } from "@testing-library/react";
import { DangerButton } from "./danger-button";

test("AlertButton", () => {
  // レンダリングでエラーがないことをテスト
  render(<DangerButton>Button</DangerButton>);
});
