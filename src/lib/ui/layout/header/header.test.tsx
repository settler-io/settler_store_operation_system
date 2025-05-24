import { render } from "@testing-library/react";
import { Header } from "./header";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn().mockReturnValue({ status: "unauthenticated" }),
}));

test("Header", () => {
  // レンダリングでエラーがないことをテスト
  // コンテンツの出し分けなどは、仕様が固まった後にテストを追加する予定
  render(<Header isDev={false} />);
});
