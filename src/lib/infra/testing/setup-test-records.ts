import { createId, User } from "@/domain/entity";
import { getTestDatabaseClient } from "./setup-test-database";

/**
 * Repositoryのテストで使う最小限の共通テストデータ作成処理
 */
export async function setupTestRecords() {
  const db = getTestDatabaseClient();

  const user = await db.user.create({
    data: User.create({ email: "email@example.com" }).getData(),
  });
  const user2 = await db.user.create({
    data: User.create({ email: "email2@example.com" }).getData(),
  });
  const user3 = await db.user.create({
    data: User.create({ email: "email3@example.com" }).getData(),
  });

  const userSetting = await db.userSetting.create({
    data: {
      id: createId(),
      userId: user.id,
      price: 300,
      withFace: true,
      imageUrl: "https://gemucha.com/image/host/hoge.jpg",
      discordId: "@hostdiscord",
      profile: "私はゲムチャホストやります！！",
      isHost: true,
      hostAt: new Date("2022-01-02"),
    },
  });

  const userSetting2 = await db.userSetting.create({
    data: {
      id: createId(),
      userId: user2.id,
      price: 100,
      withFace: true,
      imageUrl: "https://gemucha.com/image/host/hoge.jpg",
      discordId: "@hostdiscord2",
      profile: "私はゲムチャホストやります！！",
      isHost: true,
      hostAt: new Date("2022-02-02"),
    },
  });

  const attraction = await db.attraction.create({
    data: {
      id: createId(),
      userId: user.id,
      startAt: new Date("2024-04-01T10:00"),
      endAt: new Date("2024-04-02T10:00"),
      message: "Attraction",
    },
  });
  const chat = await db.chat.createMany({
    data: [
      {
        id: createId(),
        sendUserId: user.id,
        receiveUserId: user2.id,
        comment: "12",
        sendAt: new Date(),
      },
      {
        id: createId(),
        sendUserId: user2.id,
        receiveUserId: user.id,
        comment: "21",
        sendAt: new Date(),
      },
    ],
  });
  const reservation = await db.reservation.create({
    data: {
      id: createId(),
      hostUserId: user.id,
      guestUserId: user2.id,
      startAt: new Date("2024-04-06"),
      endAt: new Date("2024-04-08"),
      price: 100,
      game: "LoL",
    },
  });
  const evaluation = await db.evaluation.createMany({
    data: [
      {
        id: createId(),
        evaluateUserId: user.id,
        evaluatedUserId: user2.id,
        comment: "12",
        score: 5,
        side: "host",
        reservationId: reservation.id,
      },
      {
        id: createId(),
        evaluateUserId: user2.id,
        evaluatedUserId: user.id,
        comment: "21",
        score: 4,
        side: "guest",
        reservationId: reservation.id,
      },
    ],
  });
  const hostImage = await db.hostImage.create({
    data: {
      id: createId(),
      imageUrl: "https://image.img",
      userId: user.id,
    },
  });
  const userGame = await db.userGame.create({
    data: {
      id: createId(),
      userId: user.id,
      name: "LoL",
    },
  });
  const viewHistory = await db.viewHistory.create({
    data: {
      id: createId(),
      viewUserId: user.id,
      viewedUserId: user2.id,
      viewAt: new Date("2024-04-08"),
    },
  });
  const viewHistory2 = await db.viewHistory.create({
    data: {
      id: createId(),
      viewUserId: user2.id,
      viewedUserId: user.id,
      viewAt: new Date("2024-04-06"),
    },
  });
  return {
    user,
    user2,
    user3,
    userSetting,
    userSetting2,
    attraction,
    reservation,
    evaluation,
    chat,
    hostImage,
    viewHistory,
    viewHistory2,
    userGame,
  } as const;
}
