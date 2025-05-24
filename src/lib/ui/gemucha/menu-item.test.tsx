import { render, screen } from "@testing-library/react";
import { MenuItem } from "./menu-item";

test("MenuItem", () => {
  // レンダリングでエラーがないことをテスト
  render(<MenuItem url="https://url.com" title="title" isHeader />);
  expect(screen.getByText("title")).toBeDefined();
});
