import { Reservation, createId } from "@/domain/entity";
import { ReservationRepository } from "@/infra/repository";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("TorecaRepository", () => {
  const db = getTestDatabaseClient();
  const repository = new ReservationRepository(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("integration", async () => {
    // 事前データの準備
    const { user, user2, reservation } = await setupTestRecords();

    // findのテスト
    await expect(repository.find(reservation.id)).resolves.toBeDefined();
    await expect(repository.find("not found id")).rejects.toThrow();

    await expect(
      repository.add(
        new Reservation({
          id: createId(),
          version: 1,
          hostUserId: user.id,
          guestUserId: user2.id,
          startAt: new Date("2024-04-06"),
          endAt: new Date("2024-04-08"),
          price: 100,
          game: "LoL",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    ).resolves.toHaveProperty("price", 100);
  });
});
