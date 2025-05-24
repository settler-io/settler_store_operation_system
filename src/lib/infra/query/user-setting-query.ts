import type { TransactionRunnerDatabaseClient } from "../types";

/**
 * Torecaを画面に表示するための処理群
 */
export class UserSettingQuery {
  #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async selectAllUsers() {
    return await this.#client.userSetting.findMany({
      where: {
        isHost: true,
      },
      include: {
        user: true,
      },
      orderBy: {
        hostAt: "desc",
      },
    });
  }

  async getUserSettingByUserId(userId: string) {
    return await this.#client.userSetting.findUnique({
      where: {
        userId,
      },
      include: {
        user: true,
      },
    });
  }

  async getChatUsersForUserId(userId: string, all?: boolean) {
    if (all) {
      return await this.#client.userSetting.findMany({
        where: {
          userId: {
            not: userId,
          },
        },
        include: {
          user: true,
        },
      });
    }
    const chats = await this.#client.chat.findMany({
      where: {
        OR: [
          {
            sendUserId: userId,
          },
          {
            receiveUserId: userId,
          },
        ],
      },
      distinct: ["sendUserId", "receiveUserId"],
    });
    const userIds = new Set<string>();
    chats.forEach((c) => {
      if (c.sendUserId !== userId) {
        userIds.add(c.sendUserId);
      }
      if (c.receiveUserId !== userId) {
        userIds.add(c.receiveUserId);
      }
    });
    return await this.#client.userSetting.findMany({
      where: {
        userId: {
          in: Array.from(userIds),
        },
      },
      include: {
        user: true,
      },
    });
  }
}
