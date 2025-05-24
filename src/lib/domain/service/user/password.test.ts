import { PasswordService } from "@/domain/service";

describe("PasswordService", () => {
  test("hashPassword", async () => {
    const service = new PasswordService("secret");
    expect(await service.hashPassword("password", "0123456789abcdef")).toBe(
      "51f5ece2a47278e71971c1c74ed08d588eb59c8ba1871969f98db345999a3ce8",
    );
  });

  test("verifyPassword", async () => {
    const service = new PasswordService("secret");
    service.hashPassword = vi.fn().mockResolvedValue("hashed password");

    const password = "password";
    const salt = "0123456789abcdef";

    // nullの場合はパスワード未設定なのでエラー
    await expect(service.verifyPassword(null, password, salt)).rejects.toThrow();
    // ハッシュ後のパスワードが一致しない場合はエラー
    await expect(service.verifyPassword("not match", password, salt)).rejects.toThrow();
    // ハッシュ後のパスワードが一致する場合はOK
    await expect(service.verifyPassword("hashed password", password, salt)).resolves.not.toThrow();
  });
});
