import { HostImageQuery } from "@/infra/query";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("HostImageQuery", () => {
  const db = getTestDatabaseClient();
  const query = new HostImageQuery(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("selectAllHostImagesByUserId", async () => {
    const { user } = await setupTestRecords();

    await expect(query.selectAllHostImagesByUserId(user.id)).resolves.toHaveLength(1);
  });

  test("selectHostImageByUrl", async () => {
    const { user } = await setupTestRecords();
    const img = await query.selectHostImageByUrl(user.id, "https://image.img");
    await expect(img?.imageUrl).eq("https://image.img");
  });
});
