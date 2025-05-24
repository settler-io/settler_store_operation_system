import type { TransactionRunnerDatabaseClient } from "../types";

/**
 * Torecaを画面に表示するための処理群
 */
export class UserGameQuery {
  #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async selectGameByName(name: string, userId: string) {
    return await this.#client.userGame.findFirst({
      where: {
        name,
        userId,
      },
    });
  }

  async selectAllGamesByUserId(userId: string) {
    return await this.#client.userGame.findMany({
      where: {
        userId,
      },
    });
  }
}
