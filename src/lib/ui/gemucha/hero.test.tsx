import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

test("Hero", () => {
  // レンダリングでエラーがないことをテスト
  render(<Hero>hero</Hero>);
  expect(screen.getByText("hero")).toBeDefined();
});
