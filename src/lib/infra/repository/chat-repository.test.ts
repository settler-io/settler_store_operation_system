import { Chat, createId } from "@/domain/entity";
import { ChatRepository } from "@/infra/repository";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("TorecaRepository", () => {
  const db = getTestDatabaseClient();
  const repository = new ChatRepository(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("integration", async () => {
    // 事前データの準備
    const { user, user2 } = await setupTestRecords();

    const add = await repository.add(
      new Chat({
        id: createId(),
        version: 1,
        sendUserId: user.id,
        receiveUserId: user2.id,
        comment: "12",
        sendAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await expect(add).toHaveProperty("comment", "12");

    // findのテスト
    await expect(repository.find(add.id)).resolves.toBeDefined();
    await expect(repository.find("not found id")).rejects.toThrow();
  });
});
