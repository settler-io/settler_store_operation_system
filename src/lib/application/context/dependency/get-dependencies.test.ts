import { getDependencies } from "./get-dependencies";

describe("getDependencies", () => {
  test("create for localhost", () => {
    // 実行時エラーが無いことを確認
    vi.stubEnv("HOST", "localhost");
    expect(() => getDependencies()).not.toThrow();
  });

  test("create for aws", () => {
    // 実行時エラーが無いことを確認
    vi.stubEnv("HOST", "app.gemucha.com");
    expect(() => getDependencies()).not.toThrow();
  });
});
