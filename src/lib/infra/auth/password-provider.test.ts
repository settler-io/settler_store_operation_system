import { PasswordProvider } from "@/infra/auth";

describe("PasswordProvider", () => {
  test("authorize", async () => {
    const repository = {
      findByEmail: vi.fn(),
    };
    const passwordService = {
      verifyPassword: vi.fn(),
    };
    const credentials = {
      email: "email@example.com",
      password: "password",
    };
    const user = {
      id: "user id",
      email: "email@example.com",
      password: "password",
      canLogin: true,
    };
    const req = vi.fn() as any;
    const provider = PasswordProvider(repository as any, passwordService as any);
    const authorize = provider.options.authorize;

    // findByEmailで見つからない場合、エラーにならずnullを返す
    repository.findByEmail.mockRejectedValue(new Error());
    passwordService.verifyPassword.mockResolvedValue(null);
    expect(await authorize(credentials, req)).toBeNull();

    // userがメール未認証の場合、エラーにならずnullを返す
    repository.findByEmail.mockResolvedValue({ ...user, canLogin: false });
    passwordService.verifyPassword.mockResolvedValue(null);
    expect(await authorize(credentials, req)).toBeNull();

    // パスワードの検証が失敗した場合、エラーにならずnullを返す
    repository.findByEmail.mockResolvedValue(user);
    passwordService.verifyPassword.mockRejectedValue(new Error());
    expect(await authorize(credentials, req)).toBeNull();

    // 認証OKの場合
    repository.findByEmail.mockResolvedValue(user);
    passwordService.verifyPassword.mockResolvedValue(null);
    expect(await authorize(credentials, req)).toStrictEqual({
      id: user.id,
      email: user.email,
    });
  });
});
