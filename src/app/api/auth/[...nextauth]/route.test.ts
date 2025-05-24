import { GET, POST } from "./route";

vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn(),
}));

// とりあえずオプション指定部分に実行時エラーがないことだけテストしておく
describe("NextAuth route handler", () => {
  test("オプション指定部分に実行時エラーがないこと", async () => {
    await expect(GET({} as any, {} as any)).resolves.not.toThrow();
    await expect(POST({} as any, {} as any)).resolves.not.toThrow();
  });
});
