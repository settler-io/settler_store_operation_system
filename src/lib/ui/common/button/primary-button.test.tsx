import { fireEvent, render, screen } from "@testing-library/react";
import { PrimaryButton } from "./primary-button";

test("PrimaryButton", () => {
  // レンダリングでエラーがないことをテスト
  render(<PrimaryButton label="label" />);

  // clickのテスト
  const handleClick = vi.fn();
  render(<PrimaryButton label="for click test" onClick={handleClick} />);
  const button = screen.getByText("for click test");
  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalledOnce();
});
