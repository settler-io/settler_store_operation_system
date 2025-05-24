import { render } from "@testing-library/react";
import { NomalButton } from "./nomal-button";

test("AlertButton", () => {
  // レンダリングでエラーがないことをテスト
  render(<NomalButton>Button</NomalButton>);
});
