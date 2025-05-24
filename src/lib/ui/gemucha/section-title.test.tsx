import { render, screen } from "@testing-library/react";
import { SectionTitle } from "./section-title";

test("SectionContainer", () => {
  // レンダリングでエラーがないことをテスト
  render(<SectionTitle title="title" />);
  expect(screen.queryByText("title")).toBeDefined();
});
