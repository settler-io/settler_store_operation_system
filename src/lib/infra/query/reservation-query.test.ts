import { ReservationQuery } from "@/infra/query";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("TorecaWithdrawRecordQuery", () => {
  const db = getTestDatabaseClient();
  const query = new ReservationQuery(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("selectAllReservationsByUserId", async () => {
    const { user } = await setupTestRecords();
    await expect(query.selectAllReservationsByUserId(user.id)).resolves.toHaveLength(1);
  });

  test("selectAllHostedReservationsByUserId", async () => {
    const { user } = await setupTestRecords();
    await expect(query.selectAllHostedReservationsByUserId(user.id)).resolves.toHaveLength(1);
  });

  test("selectReservationByUserId", async () => {
    const { reservation } = await setupTestRecords();
    await expect(query.selectReservationByUserId(reservation.id)).resolves.toHaveProperty("id", reservation.id);
  });
  test("selectMonthEarningByUserId", async () => {
    const { user } = await setupTestRecords();
    await expect(
      query.selectMonthEarningByUserId(user.id, new Date("2024-04-01"), new Date("2024-04-30")),
    ).resolves.toHaveProperty("_sum", { price: 100 });
  });
});
