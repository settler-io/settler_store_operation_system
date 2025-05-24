import { render, screen } from "@testing-library/react";
import { HostListWrapper } from "./host-list-wrapper";

test("HostListWrapper", () => {
  // レンダリングでエラーがないことをテスト
  render(<HostListWrapper>List</HostListWrapper>);
  expect(screen.getByText("List")).toBeDefined();
});
