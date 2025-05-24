import { HostImage, createId } from "@/domain/entity";
import { HostImageRepository } from "@/infra/repository";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("TorecaRepository", () => {
  const db = getTestDatabaseClient();
  const repository = new HostImageRepository(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("integration", async () => {
    // 事前データの準備
    const { user, hostImage } = await setupTestRecords();

    // findのテスト
    await expect(repository.find(hostImage.id)).resolves.toBeDefined();
    await expect(repository.find("not found id")).rejects.toThrow();

    const add = await repository.add(
      new HostImage({
        id: createId(),
        version: 1,
        imageUrl: "https://image.img",
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    await expect(add).toHaveProperty("userId", user.id);

    add.updateImageUrl("https://image.img/new");
    await repository.save(add);
    const save = await repository.find(add.id);
    await expect(save).toHaveProperty("imageUrl", "https://image.img/new");
    await repository.delete(save);
    await expect(repository.find(save.id)).rejects.toThrow();
  });
});
