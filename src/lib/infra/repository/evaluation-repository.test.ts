import { Evaluation, createId } from "@/domain/entity";
import { EvaluationRepository } from "@/infra/repository";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("TorecaRepository", () => {
  const db = getTestDatabaseClient();
  const repository = new EvaluationRepository(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("integration", async () => {
    // 事前データの準備
    const { user, user3, reservation } = await setupTestRecords();

    const add = await repository.add(
      new Evaluation({
        id: createId(),
        version: 1,
        evaluateUserId: user.id,
        evaluatedUserId: user3.id,
        comment: "12",
        score: 5,
        side: "host",
        reservationId: reservation.id,
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
