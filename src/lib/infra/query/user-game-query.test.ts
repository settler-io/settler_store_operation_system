import { UserGameQuery } from "@/infra/query";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("TorecaWithdrawRecordQuery", () => {
  const db = getTestDatabaseClient();
  const query = new UserGameQuery(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("selectGameByName", async () => {
    const { user } = await setupTestRecords();
    await expect(query.selectGameByName("LoL", user.id)).resolves.toHaveProperty("name", "LoL");
  });

  test("selectAllGamesByUserId", async () => {
    const { user } = await setupTestRecords();
    await expect(query.selectAllGamesByUserId(user.id)).resolves.toHaveLength(1);
  });
});
