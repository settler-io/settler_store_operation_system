import { UserSetting, createId } from "@/domain/entity";
import { UserSettingRepository } from "@/infra/repository";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("TorecaRepository", () => {
  const db = getTestDatabaseClient();
  const repository = new UserSettingRepository(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("integration", async () => {
    // 事前データの準備
    const { user3, userSetting } = await setupTestRecords();

    // findのテスト
    await expect(repository.find(userSetting.id)).resolves.toBeDefined();
    await expect(repository.find("not found id")).rejects.toThrow();

    const add = await repository.add(
      new UserSetting({
        id: createId(),
        version: 1,
        userId: user3.id,
        price: 100,
        withFace: true,
        imageUrl: "https://gemucha.com/image/host/hoge.jpg",
        discordId: "@hostdiscord2",
        profile: "私はゲムチャホストやります！！",
        isHost: true,
        hostAt: new Date("2022-02-02"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    await expect(add).toHaveProperty("price", 100);
    add.updatePrice(200);
    await repository.save(add);
    const save = await repository.find(add.id);
    await expect(save).toHaveProperty("price", 200);
  });
});
