import { EmailVerificationTokenService } from "@/domain/service";

describe("EmailVerificationTokenService", () => {
  const repository = {
    add: vi.fn(),
    find: vi.fn(),
    deleteAllByEmail: vi.fn(),
  };
  const service = new EmailVerificationTokenService(repository as any);

  test("issueToken", async () => {
    const createdTokenId = await service.issueToken({ userId: "userId1234567890", email: "email@example.com" });

    expect(createdTokenId).toHaveLength(16);
    expect(repository.add).toHaveBeenCalledOnce();
  });

  test("verifyToken valid case", async () => {
    // トークンが期限内の場合
    repository.find.mockResolvedValue({
      userId: "userId1234567890",
      email: "email@example.com",
      isExpired() {
        return false;
      },
    });

    const result = await service.verifyToken("token id");

    expect(result).toStrictEqual({
      userId: "userId1234567890",
      verifiedEmail: "email@example.com",
    });
    expect(repository.find).toHaveBeenCalledOnce();
  });

  test("verifyToken invalid case", async () => {
    // トークンの期限が切れている場合はエラー
    repository.find.mockResolvedValue({
      isExpired() {
        return true;
      },
    });

    await expect(service.verifyToken("token id")).rejects.toThrow();
  });

  test("flushAllTokens", async () => {
    // 引数のemailを使っていることをテスト
    await service.flushAllTokens("email@example.com");
    expect(repository.deleteAllByEmail).toHaveBeenCalledOnce();
    expect(repository.deleteAllByEmail).toHaveBeenCalledWith("email@example.com");
  });
});
