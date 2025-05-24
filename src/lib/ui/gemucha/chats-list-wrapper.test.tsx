import { act, render, screen, waitFor } from "@testing-library/react";
import { ChatsListWrapper } from "./chats-list-wrapper";

describe("ChatsListWrapper", () => {
  vi.mock("next/headers", () => {
    return {
      headers: () => {
        return { get: vi.fn() };
      },
    };
  });
  vi.mock("../../../app/mypage/chat/action", () => {
    return {
      getChat: vi.fn().mockResolvedValueOnce([
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
      ]),
    };
  });
  window.HTMLElement.prototype.scrollIntoView = vi.fn();

  test("ChatsListWrapper", async () => {
    // レンダリングでエラーがないことをテスト
    await act(async () => render(<ChatsListWrapper targetId="targetId12345678" sessionUserId="sessionUserId123" />));
    await waitFor(() => expect(screen.getByText("comment")).toBeInTheDocument());
  });
});
