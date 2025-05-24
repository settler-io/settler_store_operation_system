import { Attraction, createId } from "@/domain/entity";
import { AttractionRepository } from "@/infra/repository";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("TorecaRepository", () => {
  const db = getTestDatabaseClient();
  const repository = new AttractionRepository(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("integration", async () => {
    // 事前データの準備
    const { user, attraction } = await setupTestRecords();

    // findのテスト
    await expect(repository.find(attraction.id)).resolves.toBeDefined();
    await expect(repository.find("not found id")).rejects.toThrow();
    const add = await repository.add(
      new Attraction({
        id: createId(),
        version: 1,
        userId: user.id,
        startAt: new Date("2024-04-01T10:00"),
        endAt: new Date("2024-04-02T10:00"),
        message: "Attraction",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    await expect(add).toHaveProperty("userId", user.id);
    add.updateMessage("Att");
    await repository.save(add);
    const save = await repository.find(add.id);
    await expect(save).toHaveProperty("message", "Att");
  });
});
