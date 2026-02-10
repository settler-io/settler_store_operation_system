/**
 * Claude Advisor Bot - メインエントリーポイント
 *
 * BigQueryのマーケティングデータを分析してDiscordでアドバイスするBot
 */

import "dotenv/config";
import { BigQueryAdvisorClient } from "./bigquery-client.js";
import { ClaudeAdvisorClient } from "./claude-client.js";
import { DiscordAdvisorBot } from "./discord-bot.js";

async function main() {
  console.log("=== Claude Advisor Bot 起動 ===");

  // 環境変数チェック
  const requiredEnvVars = [
    "ANTHROPIC_API_KEY",
    "DISCORD_BOT_TOKEN",
    "GCP_PROJECT_ID",
    "BIGQUERY_DATASET",
    "GOOGLE_APPLICATION_CREDENTIALS",
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`必須環境変数が未設定: ${envVar}`);
      process.exit(1);
    }
  }

  // BigQueryクライアント初期化
  console.log("1. BigQueryクライアント初期化...");
  const bqClient = new BigQueryAdvisorClient(
    process.env.GCP_PROJECT_ID!,
    process.env.BIGQUERY_DATASET!,
    process.env.GOOGLE_APPLICATION_CREDENTIALS!
  );

  // 会話履歴テーブルを確保
  await bqClient.ensureConversationTable();

  // スキーマ情報を表示
  const tables = await bqClient.listTables();
  console.log(`  利用可能テーブル: ${tables.join(", ")}`);

  // Claude APIクライアント初期化
  console.log("2. Claude APIクライアント初期化...");
  const claudeClient = new ClaudeAdvisorClient(
    process.env.ANTHROPIC_API_KEY!,
    bqClient,
    process.env.GITHUB_TOKEN || ""
  );
  await claudeClient.initialize();

  // Discord Bot初期化・起動
  console.log("3. Discord Bot起動...");
  const bot = new DiscordAdvisorBot(claudeClient, bqClient);
  await bot.start(process.env.DISCORD_BOT_TOKEN!);

  console.log("=== Bot稼働中 ===");
  console.log(`チャンネルID: ${process.env.DISCORD_CHANNEL_ID || "(全チャンネル)"}`);

  // シャットダウンハンドラー
  const shutdown = async () => {
    console.log("\nBot停止中...");
    await bot.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("起動エラー:", error);
  process.exit(1);
});
