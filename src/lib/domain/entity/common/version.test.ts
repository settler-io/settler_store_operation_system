import { initialVersion } from "./version";

describe("entity/common/version", () => {
  test("should generate initial version", () => {
    // 初期値は0
    expect(initialVersion()).toBe(0);
  });
});
