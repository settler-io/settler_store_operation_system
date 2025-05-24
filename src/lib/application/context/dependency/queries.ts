import {
  AttractionQuery,
  ChatQuery,
  EvaluationQuery,
  HostImageQuery,
  ReservationQuery,
  UserGameQuery,
  UserQuery,
  UserSettingQuery,
  ViewHistoryQuery,
} from "@/infra/query";
import type { TransactionRunnerDatabaseClient } from "@/infra/types";

export function getQueries(db: TransactionRunnerDatabaseClient) {
  const userQuery = new UserQuery(db);
  const attractionQuery = new AttractionQuery(db);
  const userSettingQuery = new UserSettingQuery(db);
  const evaluationQuery = new EvaluationQuery(db);
  const userGameQuery = new UserGameQuery(db);
  const chatQuery = new ChatQuery(db);
  const reservationQuery = new ReservationQuery(db);
  const viewHistoryQuery = new ViewHistoryQuery(db);
  const hostImageQuery = new HostImageQuery(db);

  return {
    userQuery,
    attractionQuery,
    userSettingQuery,
    evaluationQuery,
    userGameQuery,
    chatQuery,
    reservationQuery,
    viewHistoryQuery,
    hostImageQuery,
  } as const;
}

export type Queries = ReturnType<typeof getQueries>;
