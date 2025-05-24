import { EmailVerificationToken } from "@/domain/entity";
import { EmailVerificationTokenRepository } from "@/infra/repository";
import { getTestDatabaseClient, resetTestDatabase, setupTestRecords } from "@/infra/testing";

describe("EmailVerificationTokenRepository", () => {
  const db = getTestDatabaseClient();
  const repository = new EmailVerificationTokenRepository(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("integration", async () => {
    // 事前データの準備
    const { user } = await setupTestRecords();

    // add
    const token = EmailVerificationToken.create({
      userId: user.id,
      email: "email@example.com",
    });
    await repository.add(token);

    // find
    await expect(repository.find(token.id)).resolves.toBeDefined();
    await expect(repository.find("not found id")).rejects.toThrow();

    // deleteAllByEmail
    expect(await db.emailVerificationToken.count()).toBe(1);
    // 無関係なものは削除されない
    await repository.deleteAllByEmail("other-email@example.com");
    expect(await db.emailVerificationToken.count()).toBe(1);
    // email合致で削除される
    await repository.deleteAllByEmail(token.email);
    expect(await db.emailVerificationToken.count()).toBe(0);
  });
});
