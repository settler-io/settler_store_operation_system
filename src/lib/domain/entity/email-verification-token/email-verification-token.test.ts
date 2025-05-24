import { EmailVerificationToken } from "./email-verification-token";

describe("EmailVerificationToken", () => {
  test("regular case", () => {
    const currentTime = new Date("2023-09-01T00:00:00.000Z");
    const data = {
      userId: "1234567890abcdef",
      email: "test@email.com",
    };

    const token = EmailVerificationToken.create(data, currentTime);
    expect(token.id).toHaveLength(16);
    expect(token.expiresAt).toStrictEqual(new Date("2023-09-01T00:30:00.000Z"));
    expect(token.userId).toBe(data.userId);
    expect(token.email).toBe(data.email);
    expect(token.version).toBe(0);

    // 未実装
    expect(() => token.getChanges()).toThrow();

    // isExpired
    expect(token.isExpired(new Date("2023-09-01T00:29:59.999Z"))).toBe(false);
    expect(token.isExpired(new Date("2023-09-01T00:30:00.000Z"))).toBe(false);
    expect(token.isExpired(new Date("2023-09-01T00:30:00.001Z"))).toBe(true);
  });
});
