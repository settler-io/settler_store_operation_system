import type { TransactionRunnerDatabaseClient } from "../types";

/**
 * Torecaを画面に表示するための処理群
 */
export class EvaluationQuery {
  #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async selectEvaluation(evaluateUserId: string, evaluatedUserId: string, reservationId: string) {
    return await this.#client.evaluation.findFirst({
      where: {
        evaluateUserId: evaluateUserId,
        evaluatedUserId: evaluatedUserId,
        reservationId: reservationId,
      },
    });
  }

  async selectAllEvaluationsByUserId(userId: string) {
    return await this.#client.evaluation.findMany({
      where: {
        evaluateUserId: userId,
      },
      include: {
        reservation: true,
        evaluatedUser: {
          include: {
            userSetting: true,
          },
        },
        evaluateUser: {
          include: {
            userSetting: true,
          },
        },
      },
    });
  }
  async selectAllEvaluatedByUserId(userId: string) {
    return await this.#client.evaluation.findMany({
      where: {
        evaluatedUserId: userId,
      },
      include: {
        reservation: true,
        evaluatedUser: {
          include: {
            userSetting: true,
          },
        },
        evaluateUser: {
          include: {
            userSetting: true,
          },
        },
      },
    });
  }

  async selectAllReservationNotEvaluatedByUserId(userId: string) {
    return await this.#client.reservation.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                guestUserId: userId,
              },
              {
                hostUserId: userId,
              },
            ],
          },
          {
            evaluation: {
              none: {
                evaluateUserId: userId,
              },
            },
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
    });
  }
}
