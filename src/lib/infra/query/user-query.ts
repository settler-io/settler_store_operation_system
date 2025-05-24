import type { IUserQuery } from "@/domain/query";
import type { TransactionRunnerDatabaseClient } from "../types";

/**
 * Userを画面に表示するための処理群
 */
export class UserQuery implements IUserQuery {
  #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async getUserWithSetting(userId: string) {
    return await this.#client.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        userSetting: true,
      },
    });
  }
}
