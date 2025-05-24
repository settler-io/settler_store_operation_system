import type { TransactionRunnerDatabaseClient } from "../types";

/**
 * Torecaを画面に表示するための処理群
 */
export class ReservationQuery {
  #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async selectAllReservationsByUserId(userId: string) {
    return await this.#client.reservation.findMany({
      where: {
        OR: [
          {
            hostUserId: userId,
          },
          {
            guestUserId: userId,
          },
        ],
      },
      include: {
        hostUser: {
          include: {
            userSetting: true,
          },
        },
        guestUser: {
          include: {
            userSetting: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async selectAllHostedReservationsByUserId(userId: string) {
    return await this.#client.reservation.findMany({
      where: {
        hostUserId: userId,
      },
      include: {
        hostUser: {
          include: {
            userSetting: true,
          },
        },
        guestUser: {
          include: {
            userSetting: true,
          },
        },
      },
      orderBy: {
        startAt: "desc",
      },
    });
  }

  async selectMonthEarningByUserId(userId: string, start: Date, end: Date) {
    return await this.#client.reservation.aggregate({
      _sum: {
        price: true,
      },
      where: {
        hostUserId: userId,
        startAt: {
          lte: end,
          gte: start,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async selectAllEarningInMonths(userId: string) {
    return await this.#client.$queryRaw`
    SELECT SUM(price) as revenue, DATE_FORMAT(start_at, '%Y/%m') as timestamp
    FROM \`reservation\` 
    WHERE host_user_id = ${userId}
    GROUP BY DATE_FORMAT(start_at, '%Y/%m')
    ORDER BY DATE_FORMAT(start_at, '%Y/%m') ASC
    `;
  }

  async selectReservationByUserId(id: string) {
    return await this.#client.reservation.findUnique({
      where: {
        id,
      },
      include: {
        hostUser: {
          include: {
            userSetting: true,
          },
        },
        guestUser: {
          include: {
            userSetting: true,
          },
        },
      },
    });
  }
}
