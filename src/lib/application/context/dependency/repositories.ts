import {
  AttractionRepository,
  ChatRepository,
  EmailVerificationTokenRepository,
  EvaluationRepository,
  HostImageRepository,
  ReservationRepository,
  UserGameRepository,
  UserRepository,
  UserSettingRepository,
  ViewHistoryRepository,
} from "@/infra/repository";
import type { TransactionRunnerDatabaseClient } from "@/infra/types";

export function getRepositories(db: TransactionRunnerDatabaseClient) {
  const userRepository = new UserRepository(db);
  const emailVerificationTokenRepository = new EmailVerificationTokenRepository(db);
  const userSettingRepository = new UserSettingRepository(db);
  const attractionRepository = new AttractionRepository(db);
  const evaluationRepository = new EvaluationRepository(db);
  const userGameRepository = new UserGameRepository(db);
  const chatRepository = new ChatRepository(db);
  const reservationRepository = new ReservationRepository(db);
  const viewHistoryRepository = new ViewHistoryRepository(db);
  const hostImageRepository = new HostImageRepository(db);

  return {
    userRepository,
    emailVerificationTokenRepository,
    userSettingRepository,
    attractionRepository,
    evaluationRepository,
    userGameRepository,
    chatRepository,
    reservationRepository,
    viewHistoryRepository,
    hostImageRepository,
  } as const;
}

export type Repositories = ReturnType<typeof getRepositories>;
