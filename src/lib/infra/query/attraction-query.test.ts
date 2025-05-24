import { AttractionQuery } from "@/infra/query";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("AttractionQuery", () => {
  const db = getTestDatabaseClient();
  const query = new AttractionQuery(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("selectAllAttractionsByUserId", async () => {
    const { user } = await setupTestRecords();

    await expect(query.selectAllAttractionsByUserId(user.id)).resolves.toHaveLength(1);
  });

  test("selectAllGemuchaAttractions", async () => {
    await expect(query.selectAllAttractions()).resolves.toHaveLength(0);
  });

  test("validateInterval", async () => {
    const { user } = await setupTestRecords();

    await expect(
      query.validateInterval(
        new Date("2024-04-01T11:00").toISOString(),
        new Date("2024-04-02T09:00").toISOString(),
        user.id,
      ),
    ).resolves.toBeFalsy();
    await expect(
      query.validateInterval(
        new Date("2024-04-02T11:00").toISOString(),
        new Date("2024-04-02T12:00").toISOString(),
        user.id,
      ),
    ).resolves.toBeTruthy();
    await expect(
      query.validateInterval(
        new Date("2024-04-01T08:00").toISOString(),
        new Date("2024-04-01T09:00").toISOString(),
        user.id,
      ),
    ).resolves.toBeTruthy();
  });

  test("searchAttraction", async () => {
    await expect(
      query.searchAttraction(new Date("2024-04-01T09:00").toISOString(), new Date("2024-04-02T12:00").toISOString()),
    ).resolves.toHaveLength(0);
  });

  test("selectAllAvailableUsers", async () => {
    await expect(query.selectAllAvailableUsers()).resolves.toHaveLength(0);
  });
});
