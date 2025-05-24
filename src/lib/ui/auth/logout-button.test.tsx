import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { signOut } from "next-auth/react";
import { LogoutButton } from "./logout-button";

vi.mock("next-auth/react", () => ({
  signOut: vi.fn().mockReturnValue(Promise.resolve()),
}));

test("LogoutButton", async () => {
  render(<LogoutButton />);
  const button = screen.getByText("ログアウト");

  // button clickでnext-authのsignInがコールされることをテスト
  await waitFor(() => {
    fireEvent.click(button);
  });
  expect(signOut).toHaveBeenCalledOnce();
  expect(signOut).toBeCalledWith({
    redirect: false,
  });
});
