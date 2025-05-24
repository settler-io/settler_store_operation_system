import { createId } from "./id";

describe("entity/common/id", () => {
  test("should generate new id", () => {
    expect(createId()).toHaveLength(16);
  });
});
