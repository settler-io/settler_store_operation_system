import { UserGame, createId } from "@/domain/entity";
import { UserGameRepository } from "@/infra/repository";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("TorecaRepository", () => {
  const db = getTestDatabaseClient();
  const repository = new UserGameRepository(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("integration", async () => {
    // 事前データの準備
    const { user, userGame } = await setupTestRecords();

    // findのテスト
    await expect(repository.find(userGame.id)).resolves.toBeDefined();
    await expect(repository.find("not found id")).rejects.toThrow();

    const add = await repository.add(
      new UserGame({
        id: createId(),
        version: 1,
        userId: user.id,
        name: "LoL",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await expect(add).toHaveProperty("name", "LoL");

    await repository.delete(add.id);
    await expect(repository.find(add.id)).rejects.toThrow();
  });
});
