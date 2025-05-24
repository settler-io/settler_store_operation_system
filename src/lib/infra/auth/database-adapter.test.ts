import { getTestDatabaseClient, resetTestDatabase } from "@/infra/testing";
import { DatabaseAdapter } from "./database-adapter";

describe("DatabaseAdapter", () => {
  const db = getTestDatabaseClient();
  const adapter = DatabaseAdapter(db);

  beforeEach(resetTestDatabase);
  afterAll(resetTestDatabase);

  test("createUser", async () => {
    const params = { email: "test@example.com", emailVerified: new Date() };
    // 初期状態は未作成である
    expect(await db.user.findFirst({ where: { email: params.email } })).toBeNull();

    // adapter.createUserによりデータが作成されることを確認
    const res = await adapter.createUser(params);
    const createdUser = await db.user.findUnique({ where: { email: params.email } });
    expect(res.id).toBe(createdUser?.id);
    expect(res.email).toBe(createdUser?.email);
    expect(res.emailVerified).toBe(null);

    // 同じemailの場合はupdateされる
    await expect(adapter.createUser(params)).resolves.not.toThrow();
  });

  test("getUser", async () => {
    // ユーザーが存在しない場合はnullを返す
    expect(await adapter.getUser("should not found")).toBe(null);
    // ユーザが存在する場合
    const createdUser = await adapter.createUser({ email: "test@example.com", emailVerified: null });
    const foundUser = await adapter.getUser(createdUser.id);
    expect(foundUser).toBeTruthy();
  });

  test("getUserByEmail", async () => {
    // 仕様上必ずnullを返す
    expect(await adapter.getUserByEmail()).toBe(null);
  });

  test("methods not implemented", async () => {
    // このアプリケーションで使わないメソッド
    await expect(adapter.updateUser()).rejects.toThrow();
    await expect(adapter.createSession()).rejects.toThrow();
    await expect(adapter.getSessionAndUser()).rejects.toThrow();
    await expect(adapter.updateSession()).rejects.toThrow();
    await expect(adapter.deleteSession()).rejects.toThrow();
  });
});
