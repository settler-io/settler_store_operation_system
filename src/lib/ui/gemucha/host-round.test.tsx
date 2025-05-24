import { render, screen } from "@testing-library/react";
import { HostRound } from "./host-round";

test("HostRound", () => {
  // レンダリングでエラーがないことをテスト
  render(<HostRound url="https://host.com" imageUrl="https://image.img" name="name" online />);
  expect(screen.getByText("name")).toBeDefined();
});
