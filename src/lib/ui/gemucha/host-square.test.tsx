import { render, screen } from "@testing-library/react";
import { HostSquare } from "./host-square";

test("HostSquare", () => {
  // レンダリングでエラーがないことをテスト
  render(<HostSquare url="https://host.com" imageUrl="https://image.img" name="name" coin={100} />);
  expect(screen.getByText("name")).toBeDefined();
});
