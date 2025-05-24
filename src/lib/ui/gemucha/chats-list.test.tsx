import { act, render, screen } from "@testing-library/react";
import { ChatsList } from "./chats-list";

describe("ChatsList", () => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  test("ChatsList", async () => {
    // レンダリングでエラーがないことをテスト
    await act(async () =>
      render(
        <ChatsList
          chatContents={[
            {
              id: "string1234567890",
              version: 1,
              sendUserId: "sendUserId",
              receiveUserId: "receiveUserId",
              comment: "comment",
              sendAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]}
          sessionUserId="sendUserId"
        />,
      ),
    );
    expect(screen.getByText("comment")).toBeDefined();
  });
});
