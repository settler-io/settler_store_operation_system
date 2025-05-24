import { User } from "./user";

describe("User", () => {
  const data = {
    email: "user@email.com",
  };

  test("create and getter", () => {
    const user = User.create(data);
    expect(user.id).toHaveLength(16);
    expect(user.version).toBe(0);
    expect(user.email).toBe(data.email);
    expect(user.password).toBe(null);
    expect(user.passwordSalt).toBe(user.id);
    expect(user.nickname).toBe("");
    expect(user.imageUrl).toBe(null);
    expect(user.pointBalance).toBe(0);
    expect(user.canLogin).toBe(false);
    expect(user.isRegistrationCompleted).toBe(false);
  });

  test("updateStatusToEmailVerified", () => {
    const user = User.create(data);
    expect(user.canLogin).toBe(false);
    user.updateStatusToEmailVerified();
    expect(user.canLogin).toBe(true);
  });

  test("updateEmail", () => {
    const user = User.create(data);
    expect(user.email).toBe(data.email);
    user.updateEmail("new@email.com");
    expect(user.email).toBe("new@email.com");
  });

  test("updatePassword", () => {
    const user = User.create(data);
    expect(user.password).toBe(null);
    const newPasswordHash = new Array(64).fill("0").join(""); // パスワードは64文字
    user.updatePassword(newPasswordHash);
    expect(user.password).toBe(newPasswordHash);
  });

  test("updateImageUrl", () => {
    const user = User.create(data);
    expect(user.imageUrl).toBe(null);
    user.updateImageUrl("https://app.gemucha.com/new-image.png");
    expect(user.imageUrl).toBe("https://app.gemucha.com/new-image.png");
  });

  test("updateProfile", () => {
    const user = User.create(data);
    expect(user.nickname).toBe("");
    user.updateProfile({ nickname: "new nickname", profile: "new profile" });
    expect(user.nickname).toBe("new nickname");
  });
});
