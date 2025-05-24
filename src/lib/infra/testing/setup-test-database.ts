import { PrismaClient } from "@prisma/client";

let client: PrismaClient | null = null;

export function getTestDatabaseClient(): PrismaClient {
  if (client) {
    return client;
  }

  return (client = new PrismaClient({
    // このデータベースは事前にマイグレーション（prisma db push）されている必要がある
    // マイグレーションはnpm run testを使って事前に行っておく
    datasourceUrl: "mysql://root:password@127.0.0.1:3306/test",
    log: [],
  }));
}

/**
 * テスト用途
 * DBの全てのテーブルからデータを削除する
 */
export async function resetTestDatabase(): Promise<void> {
  await resetDatabase(getTestDatabaseClient());
}

/**
 * seedの処理で使うために分割した処理
 * 外部キー制約があるため順番を考慮して削除していく必要がある
 */
export async function resetDatabase(client: PrismaClient): Promise<void> {
  await client.pointHistory.deleteMany();
  await client.emailVerificationToken.deleteMany();
  await client.userSetting.deleteMany();
  await client.attraction.deleteMany();
  await client.chat.deleteMany();
  await client.evaluation.deleteMany();
  await client.reservation.deleteMany();
  await client.hostImage.deleteMany();
  await client.userGame.deleteMany();
  await client.viewHistory.deleteMany();
  await client.user.deleteMany();
}
