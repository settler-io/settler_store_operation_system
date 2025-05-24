import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { MenuItemSetting } from "./menu-item-setting";

test("MenuItemSetting", async () => {
  // レンダリングでエラーがないことをテスト
  await act(async () => render(<MenuItemSetting title="title" isHeader />));
  screen.debug();
  expect(screen.getByText("title")).toBeDefined();
});
