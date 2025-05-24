import { fireEvent, render, screen } from "@testing-library/react";
import { AlertButton } from "./alert-button";

test("AlertButton", () => {
  // レンダリングでエラーがないことをテスト
  render(<AlertButton label="label" />);

  // clickのテスト
  const handleClick = vi.fn();
  render(<AlertButton label="for click test" onClick={handleClick} />);
  const button = screen.getByText("for click test");
  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalledOnce();
});
