import { User } from "@/domain/entity";
import { getTestDatabaseClient, resetTestDatabase } from "@/infra/testing";
import { UserRepository } from "./user-repository";

describe("UserRepository", () => {
  const db = getTestDatabaseClient();
  const repository = new UserRepository(db);
  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("integration", async () => {
    // add, findの一連のテスト
    expect(await db.user.count()).toBe(0);
    const user = User.create({ email: "email@example.com" });
    await repository.add(user);
    expect(await db.user.count()).toBe(1);

    // find, findByEmail
    await expect(repository.find(user.id)).resolves.toBeDefined();
    await expect(repository.find("not found id")).rejects.toThrow();
    await expect(repository.findByEmail(user.email)).resolves.toBeDefined();
    await expect(repository.findByEmail("not-found@example.com")).rejects.toThrow();

    // save
    // 排他制御されているため、1番目は正常に保存できて、2番目はエラーになる
    const u1 = await repository.find(user.id);
    const u2 = await repository.find(user.id);
    u1.updateProfile({ nickname: "name u1", profile: "" });
    u2.updateProfile({ nickname: "name u2", profile: "" });
    // u1の更新時にversionが変わるため、u2の更新でエラーになる
    await expect(repository.save(u1)).resolves.not.toThrow();
    await expect(repository.save(u2)).rejects.toThrow();
    const u3 = await repository.find(user.id);
    expect(u3.nickname).toBe("name u1");
  });
});
