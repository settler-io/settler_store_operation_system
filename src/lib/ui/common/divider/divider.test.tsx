import { render } from "@testing-library/react";
import { Divider } from "./divider";

test("Divider", () => {
  // レンダリングでエラーがないことをテスト
  render(<Divider />);
  render(<Divider marginTop="16px" />);
  render(<Divider marginBottom="16px" />);
});
