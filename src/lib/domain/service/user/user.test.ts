import { UserService } from "@/domain/service";

describe("UserService", () => {
  const userRepository = {
    find: vi.fn(),
    add: vi.fn(),
    save: vi.fn(),
  };

  const hashedPassword = new Array(64).fill("0").join(""); // パスワードは64文字
  const passwordService = {
    hashPassword: vi.fn().mockResolvedValue(hashedPassword),
  };
  const service = new UserService(userRepository as any, passwordService as any);

  test("registerNewUserWithEmailAndPassword", async () => {
    // 実行時エラーがないことをテスト
    await service.registerNewUserWithEmailAndPassword({
      email: "email@example.com",
      password: "password",
    });
  });

  test("updateEmail", async () => {
    const user = {
      updateEmail: vi.fn(),
      updateStatusToEmailVerified: vi.fn(),
    };
    userRepository.find.mockResolvedValue(user);
    await service.updateEmail("userId", "new-email@example.com");
    expect(user.updateEmail).toHaveBeenCalledWith("new-email@example.com");
    expect(user.updateStatusToEmailVerified).toHaveBeenCalled();
    expect(userRepository.save).toHaveBeenCalledWith(user);
  });

  test("updatePassword", async () => {
    const user = {
      updatePassword: vi.fn(),
    };
    userRepository.find.mockResolvedValue(user);
    await service.updatePassword("userId", "password");
    // 実際に保存されるパスワードは入力をハッシュした値になっている
    expect(user.updatePassword).toHaveBeenCalledWith(hashedPassword);
    expect(userRepository.save).toHaveBeenCalledWith(user);
  });

  test("updateImageUrl", async () => {
    const user = {
      updateImageUrl: vi.fn(),
    };
    userRepository.find.mockResolvedValue(user);
    await service.updateImageUrl("userId", "https://example.com/image.png");
    expect(user.updateImageUrl).toHaveBeenCalledWith("https://example.com/image.png");
    expect(userRepository.save).toHaveBeenCalledWith(user);
  });

  test("updateProfile", async () => {
    const user = {
      updateProfile: vi.fn(),
    };
    userRepository.find.mockResolvedValue(user);
    await service.updateProfile("userId", { nickname: "nickname", profile: "profile" });
    expect(user.updateProfile).toHaveBeenCalledWith({ nickname: "nickname", profile: "profile" });
    expect(userRepository.save).toHaveBeenCalledWith(user);
  });

  test("updateUserStatusToEmailVerified", async () => {
    const user = {
      updateStatusToEmailVerified: vi.fn(),
    };
    userRepository.find.mockResolvedValue(user);
    await service.updateStatusToEmailVerified("userId");
    expect(user.updateStatusToEmailVerified).toHaveBeenCalledWith();
    expect(userRepository.save).toHaveBeenCalledWith(user);
  });
});
