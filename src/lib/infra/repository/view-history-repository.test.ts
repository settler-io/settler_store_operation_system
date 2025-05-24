import { ViewHistory, createId } from "@/domain/entity";
import { ViewHistoryRepository } from "@/infra/repository";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("TorecaRepository", () => {
  const db = getTestDatabaseClient();
  const repository = new ViewHistoryRepository(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("integration", async () => {
    // 事前データの準備
    const { user, user3, viewHistory } = await setupTestRecords();

    // findのテスト
    await expect(repository.find(viewHistory.id)).resolves.toBeDefined();
    await expect(repository.find("not found id")).rejects.toThrow();

    const add = await repository.add(
      new ViewHistory({
        id: createId(),
        version: 1,
        viewUserId: user.id,
        viewedUserId: user3.id,
        viewAt: new Date("2024-04-08"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    await expect(add).toHaveProperty("viewUserId", user.id);

    add.updateViewAt(new Date("2024-04-10"));
    await repository.save(add);
    const save = await repository.find(add.id);
    await expect(save).toHaveProperty("viewAt", new Date("2024-04-10"));
  });
});
