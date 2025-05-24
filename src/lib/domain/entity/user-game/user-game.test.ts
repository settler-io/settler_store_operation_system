import { UserSetting } from "@/domain/entity";

describe("UserSetting", () => {
  const data = {
    id: "toreca1234567890",
    userId: "ownerUserId12345",
    version: 0,
    price: 100,
    withFace: true,
    imageUrl: "https://image.com",
    profile: "profile",
    discordId: "discordId",
    isHost: true,
    hostAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  test("create and getter", () => {
    const setting = new UserSetting(data);

    expect(setting.id).toBe(data.id);
    expect(setting.version).toBe(data.version);
    expect(setting.price).toBe(data.price);
    expect(setting.profile).toBe(data.profile);
    expect(setting.userId).toBe(data.userId);
    expect(setting.updatedAt).toStrictEqual(data.updatedAt);
  });
  test("create", () => {
    const setting = UserSetting.create(data);

    expect(setting.price).toBe(data.price);
    expect(setting.profile).toBe(data.profile);
    expect(setting.userId).toBe(data.userId);
  });
});
