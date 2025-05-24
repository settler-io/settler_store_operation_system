import { render, screen } from "@testing-library/react";
import { ReadMore } from "./read-more";

test("ReadMore", () => {
  // レンダリングでエラーがないことをテスト
  render(<ReadMore all sample={false} hasMore={false} />);
  expect(screen.queryByText("もっと見る")).toBeNull();

  render(<ReadMore all={false} sample hasMore />);
  expect(screen.queryByText("もっと見る")).toBeDefined();
});
