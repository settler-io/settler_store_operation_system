import { UserSettingQuery } from "@/infra/query";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("UserSettingQuery", () => {
  const db = getTestDatabaseClient();
  const query = new UserSettingQuery(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("selectAllUsers", async () => {
    await setupTestRecords();
    await expect(query.selectAllUsers()).resolves.toHaveLength(2);
  });

  test("getUserSettingByUserId", async () => {
    const { user } = await setupTestRecords();
    const setting = await query.getUserSettingByUserId(user.id);

    await expect(setting?.isHost).toBeTruthy();
  });

  test("getChatUsersForUserId", async () => {
    const { user } = await setupTestRecords();
    await expect(query.getChatUsersForUserId(user.id)).resolves.toHaveLength(1);
  });
});
