/**
 * GMOあおぞらネット銀行 Discord Bot
 *
 * 入出金明細をDiscordに投稿する常駐Bot
 *
 * コマンド:
 *   @bot           → 前日の入出金明細
 *   @bot 残高       → 残高照会
 *   @bot 入出金 2026-02-01 2026-02-08 → 指定期間の入出金明細
 *
 * 自動投稿:
 *   毎日JST 9:00に前日の入出金明細をDISCORD_CHANNEL_IDに投稿
 */

import "dotenv/config";
import { GmoAozoraClient } from "./gmoaozora-client.js";
import { GmoAozoraDiscordBot } from "./discord-bot.js";

async function main(): Promise<void> {
  console.log("=== GMOあおぞら入出金Bot 起動 ===");

  // 環境変数チェック
  const accessToken = process.env.GMO_AOZORA_ACCESS_TOKEN;
  const accountId = process.env.GMO_AOZORA_ACCOUNT_ID;
  const discordToken = process.env.DISCORD_BOT_TOKEN;
  const useSandbox = process.env.GMO_AOZORA_USE_SANDBOX === "true";

  if (!accessToken) {
    throw new Error("GMO_AOZORA_ACCESS_TOKEN が設定されていません");
  }
  if (!accountId) {
    throw new Error("GMO_AOZORA_ACCOUNT_ID が設定されていません");
  }
  if (!discordToken) {
    throw new Error("DISCORD_BOT_TOKEN が設定されていません");
  }

  // GMOあおぞらクライアント初期化
  console.log("1. GMOあおぞらAPIクライアント初期化...");
  const gmoClient = new GmoAozoraClient(accessToken, useSandbox);

  // Discord Bot起動
  console.log("2. Discord Bot起動...");
  const bot = new GmoAozoraDiscordBot(gmoClient, accountId);
  await bot.start(discordToken);

  console.log("=== Bot稼働中 ===");
  console.log(`チャンネルID: ${process.env.DISCORD_CHANNEL_ID || "(自動投稿OFF)"}`);

  // Graceful shutdown
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
