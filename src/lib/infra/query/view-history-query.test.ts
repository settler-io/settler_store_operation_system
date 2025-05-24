import { ViewHistoryQuery } from "@/infra/query";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("TorecaWithdrawRecordQuery", () => {
  const db = getTestDatabaseClient();
  const query = new ViewHistoryQuery(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("selectTorecaWithdrawRecord", async () => {
    const { user } = await setupTestRecords();

    await expect(query.selectAllViewsByUserId(user.id)).resolves.toHaveLength(1);
  });

  test("selectTorecaWithdrawRecord", async () => {
    const { user } = await setupTestRecords();

    await expect(query.selectAllViewedByUserId(user.id)).resolves.toHaveLength(1);
  });
});
