import { render } from "@testing-library/react";
import { StarRates } from "./star-rates";

test("StarRates", () => {
  // レンダリングでエラーがないことをテスト
  render(<StarRates percent={0.8} />);
});
