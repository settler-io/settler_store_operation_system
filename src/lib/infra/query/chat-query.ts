import type { TransactionRunnerDatabaseClient } from "../types";

/**
 * Torecaを画面に表示するための処理群
 */
export class ChatQuery {
  #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async selectAllChatsByUserId(userId: string, targetId: string) {
    return await this.#client.chat.findMany({
      where: {
        OR: [
          {
            sendUserId: userId,
            receiveUserId: targetId,
          },
          {
            sendUserId: targetId,
            receiveUserId: userId,
          },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }
}
