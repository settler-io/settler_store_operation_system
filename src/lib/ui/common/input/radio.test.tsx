import { render } from "@testing-library/react";
import { InputRadio } from "./radio";

test("InputRadio", () => {
  // レンダリングでエラーがないことをテスト
  render(<InputRadio label="radio" />);
});
