import type { TransactionRunnerDatabaseClient } from "../types";

/**
 * Torecaを画面に表示するための処理群
 */
export class AttractionQuery {
  #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async selectAllAttractionsByUserId(userId: string) {
    return await this.#client.attraction.findMany({
      where: {
        userId,
      },
    });
  }

  async validateInterval(start: string, end: string, id: string) {
    const find = await this.#client.attraction.findFirst({
      where: {
        userId: id,
        OR: [
          // include
          {
            startAt: {
              gte: start,
            },
            endAt: {
              lte: end,
            },
          },
          // contain
          {
            startAt: {
              lte: start,
            },
            endAt: {
              gte: end,
            },
          },
          // overlap
          {
            startAt: {
              gte: start,
              lte: end,
            },
          },
          {
            endAt: {
              gte: start,
              lte: end,
            },
          },
        ],
      },
    });
    return !find;
  }

  async searchAttraction(start: string, end: string) {
    return await this.#client.attraction.findMany({
      where: {
        startAt: {
          gte: start,
        },
        endAt: {
          lte: end,
        },
      },
      include: {
        user: {
          include: {
            userSetting: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
  async selectAllAttractions() {
    return await this.#client.attraction.findMany({
      where: {
        endAt: {
          gte: new Date(),
        },
      },
      include: {
        user: {
          include: {
            userSetting: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async selectAllAvailableUsers() {
    const now = new Date();
    const atts = await this.#client.attraction.findMany({
      where: {
        startAt: {
          lte: now,
        },
        endAt: {
          gte: now,
        },
      },
      include: {
        user: {
          include: {
            userSetting: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const track = new Set();
    return atts
      .filter((a) => {
        if (!track.has(a.userId) && a.user.userSetting?.isHost) {
          track.add(a.userId);
          return true;
        }
        return false;
      })
      .map((a) => a.user);
  }
}
