import { render } from "@testing-library/react";
import { FixedFooter } from "./fixed-footer";

test("FixedFooter", () => {
  // レンダリングでエラーがないことをテスト
  render(<FixedFooter>some contents</FixedFooter>);
});
