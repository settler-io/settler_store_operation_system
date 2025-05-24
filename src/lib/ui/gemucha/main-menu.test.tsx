import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { MainMenu } from "./main-menu";

test("ListItem", async () => {
  // レンダリングでエラーがないことをテスト
  await act(async () => render(<MainMenu />));
  screen.debug();
  expect(screen.getByText("マイページ")).toBeDefined();
});
