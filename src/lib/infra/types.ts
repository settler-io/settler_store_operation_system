import type { PrismaClient } from "@prisma/client";

/**
 * Prisma.$transaction 内で使えるclient
 */
export type TransactionRunnerDatabaseClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
