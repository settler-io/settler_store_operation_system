import { render, screen } from "@testing-library/react";
import { AttractionItem } from "./attraction-item";

test("AttractionItem", () => {
  // レンダリングでエラーがないことをテスト
  render(
    <AttractionItem
      imageUrl={"https://image.img"}
      name="item"
      date="2024-04-08"
      desc="desc"
      price="80円"
      userId="userId1234567890"
    />,
  );
  screen.debug();
  expect(screen.getByAltText("user icon")).toBeDefined();
  expect(screen.getByText("desc")).toBeDefined();
  expect(screen.getByText("item")).toBeDefined();
  expect(screen.getByText("2024-04-08")).toBeDefined();
  expect(screen.getByText("80円")).toBeDefined();
  expect(screen.getByText("コイン/30分")).toBeDefined();
});
