import type { TransactionRunnerDatabaseClient } from "../types";

export class ViewHistoryQuery {
  #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async selectAllViewsByUserId(userId: string) {
    return await this.#client.viewHistory.findMany({
      where: {
        viewUserId: userId,
      },
      include: {
        viewUser: {
          include: {
            userSetting: true,
          },
        },
        viewedUser: {
          include: {
            userSetting: true,
          },
        },
      },
      orderBy: {
        viewAt: "desc",
      },
    });
  }
  async selectAllViewedByUserId(userId: string) {
    return await this.#client.viewHistory.findMany({
      where: {
        viewedUserId: userId,
      },
      include: {
        viewUser: {
          include: {
            userSetting: true,
          },
        },
        viewedUser: {
          include: {
            userSetting: true,
          },
        },
      },
      orderBy: {
        viewAt: "desc",
      },
    });
  }

  async selectView(viewUserId: string, viewedUserId: string) {
    return await this.#client.viewHistory.findFirst({
      where: {
        viewUserId: viewUserId,
        viewedUserId: viewedUserId,
      },
    });
  }
}
