import { EvaluationQuery } from "@/infra/query";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("EvaluationQuery", () => {
  const db = getTestDatabaseClient();
  const query = new EvaluationQuery(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("selectAllEvaluatedByUserId", async () => {
    const { user, user2 } = await setupTestRecords();

    await expect(query.selectAllEvaluatedByUserId(user.id)).resolves.toHaveLength(1);
    await expect(query.selectAllEvaluatedByUserId(user2.id)).resolves.toHaveLength(1);
  });

  test("selectAllEvaluationsByUserId", async () => {
    const { user } = await setupTestRecords();

    await expect(query.selectAllEvaluationsByUserId(user.id)).resolves.toHaveLength(1);
  });

  test("selectAllReservationNotEvaluatedByUserId", async () => {
    const { user } = await setupTestRecords();
    await expect(query.selectAllReservationNotEvaluatedByUserId(user.id)).resolves.toHaveLength(0);
  });
});
