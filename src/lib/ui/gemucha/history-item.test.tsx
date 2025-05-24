import { render, screen } from "@testing-library/react";
import { HistoryItem } from "./history-item";

test("HistoryItem", () => {
  // レンダリングでエラーがないことをテスト
  render(
    <HistoryItem
      host
      imageUrl={"https://image.img"}
      name="name"
      from={new Date("2024-04-06")}
      to={new Date("2024-04-08")}
      prefixIcon
      trail={<div>trail</div>}
      isSmall
    />,
  );
  expect(screen.getByText("name")).toBeDefined();
  expect(screen.getByText("trail")).toBeDefined();
});
