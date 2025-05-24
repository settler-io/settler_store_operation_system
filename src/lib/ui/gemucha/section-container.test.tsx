import { render, screen } from "@testing-library/react";
import { SectionContainer } from "./section-container";

test("SectionContainer", () => {
  // レンダリングでエラーがないことをテスト
  render(<SectionContainer>Section</SectionContainer>);
  expect(screen.queryByText("Section")).toBeDefined();
});
