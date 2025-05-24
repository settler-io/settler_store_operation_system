import type { TransactionRunnerDatabaseClient } from "../types";

/**
 * Torecaを画面に表示するための処理群
 */
export class HostImageQuery {
  #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async selectAllHostImagesByUserId(userId: string) {
    return await this.#client.hostImage.findMany({
      where: {
        userId,
      },
    });
  }

  async selectHostImageByUrl(userId: string, imageUrl: string) {
    return await this.#client.hostImage.findFirst({
      where: {
        userId,
        imageUrl,
      },
    });
  }
}
