import { getServerContext } from "./context";

vi.mock("../auth/session", () => ({
  getUserSession: vi.fn(),
}));

describe("ServerContext", () => {
  // 処理の具体的なテストは後で追加する
  // 現状はパラメータなしの実行でエラーが無いことだけをテストしている
  test("should create context without error", async () => {
    expect(await getServerContext()).toBeTruthy();
  });
});
