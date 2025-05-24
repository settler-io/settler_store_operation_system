import { ChatQuery } from "@/infra/query";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("ChatQuery", () => {
  const db = getTestDatabaseClient();
  const query = new ChatQuery(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("selectAllChatsByUserId", async () => {
    const { user, user2 } = await setupTestRecords();

    await expect(query.selectAllChatsByUserId(user.id, user2.id)).resolves.toHaveLength(2);
  });
});
