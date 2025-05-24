import { render, screen } from "@testing-library/react";
import { EarningItem, EarningItemMonthlySales } from "./earning-item";

test("EarningItem", () => {
  // レンダリングでエラーがないことをテスト
  render(<EarningItem imageUrl="https://image.img" date="2024-04-08" name="name" />);
  expect(screen.getByText("2024-04-08")).toBeDefined();
  expect(screen.getByText("name")).toBeDefined();
});

test("EarningItemMonthlySales", () => {
  // レンダリングでエラーがないことをテスト
  render(<EarningItemMonthlySales imageUrl="https://image.img" date="2024-04-08" name="name" />);
  expect(screen.getByText("2024-04-08")).toBeDefined();
  expect(screen.getByText("name")).toBeDefined();
});
