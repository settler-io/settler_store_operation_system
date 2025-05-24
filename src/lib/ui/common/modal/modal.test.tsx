import { Modal } from "@/ui/common";
import { fireEvent, render, screen } from "@testing-library/react";

describe("Modal", () => {
  // jsdomはdialogの各メソッドを実装していないためモックを追加
  // https://github.com/jsdom/jsdom/issues/3294
  const showModal = vi.fn(function mock(this: HTMLDialogElement) {
    this.open = true;
  });
  const close = vi.fn(function mock(this: HTMLDialogElement) {
    this.open = false;
  });
  HTMLDialogElement.prototype.showModal = showModal;
  HTMLDialogElement.prototype.close = close;

  test("isOpen=falseの場合", async () => {
    render(
      <Modal>
        <p>content</p>
      </Modal>,
    );

    // dialogはhidden状態で、open属性はfalseでレンダリングされている
    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(dialog.hasAttribute("open")).toBe(false);
  });

  test("isOpen=trueの場合", async () => {
    render(
      <Modal isOpen={true}>
        <p>content</p>
      </Modal>,
    );

    // open属性がtrueでレンダリングされている
    const dialog = screen.getByRole("dialog");
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(showModal).toHaveBeenCalled();

    // content部分のclickではダイアログは閉じない
    const content = screen.getByText("content");
    fireEvent.click(content);
    expect(dialog.hasAttribute("open")).toBe(true);
    // dialog部分のclickではダイアログは閉じる
    fireEvent.click(dialog);
    expect(dialog.hasAttribute("open")).toBe(false);
    expect(close).toHaveBeenCalled();
  });
});
