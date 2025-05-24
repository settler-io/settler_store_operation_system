import { render, screen } from "@testing-library/react";
import { ListItem } from "./list-item";

test("ListItem", () => {
  // レンダリングでエラーがないことをテスト
  render(
    <ListItem icon={<div>Icon</div>} title="title" subTitle="subtitle" desc="desc" right={<div>right</div>} selected />,
  );
  expect(screen.getByText("title")).toBeDefined();
  expect(screen.getByText("subtitle")).toBeDefined();
  expect(screen.getByText("desc")).toBeDefined();
  expect(screen.getByText("right")).toBeDefined();
});
