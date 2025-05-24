import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GamesList } from "./game-list";

test("GamesList", () => {
  const action = vi.fn();
  // レンダリングでエラーがないことをテスト
  render(<GamesList games={["その他"]} onGameChanged={action} />);
  const check = screen.getAllByRole("checkbox").at(0) as Element;
  waitFor(() => {
    fireEvent.click(check);
  });
  expect(action).toHaveBeenCalledOnce();
});
