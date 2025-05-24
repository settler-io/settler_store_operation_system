import { fireEvent, render, screen } from "@testing-library/react";
import { OutlineButton } from "./outline-button";

test("OutlineButton", () => {
  // レンダリングでエラーがないことをテスト
  render(<OutlineButton label="label" />);
  render(<OutlineButton label="label" icon={<svg></svg>} />);

  // clickのテスト
  const handleClick = vi.fn();
  render(<OutlineButton label="for click test" onClick={handleClick} />);
  const button = screen.getByText("for click test");
  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalledOnce();
});
