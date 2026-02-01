/**
 * Google Analytics Discord Bot
 * 前日のGA4データを取得してDiscordに投稿する
 */

import "dotenv/config";
import { createGaClientFromEnv } from "./ga-client.js";
import { createDiscordWebhookFromEnv } from "./discord-webhook.js";

async function main(): Promise<void> {
  console.log("=== GA Discord Bot 開始 ===");
  console.log(`実行時刻: ${new Date().toISOString()}`);

  const discord = createDiscordWebhookFromEnv();

  try {
    // GA クライアント作成
    const gaClient = createGaClientFromEnv();
    console.log("GA クライアント初期化完了");

    // 前日のレポートを取得
    console.log("前日のレポートを取得中...");
    const report = await gaClient.getYesterdayReport();
    console.log(`レポート取得完了: ${report.daily.date}`);

    // サマリー出力
    console.log("\n=== レポートサマリー ===");
    console.log(`日付: ${report.daily.date}`);
    console.log(`アクティブユーザー: ${report.daily.activeUsers}`);
    console.log(`新規ユーザー: ${report.daily.newUsers}`);
    console.log(`セッション数: ${report.daily.sessions}`);
    console.log(`ページビュー: ${report.daily.screenPageViews}`);

    // Discordに送信
    console.log("\nDiscordにレポートを送信中...");
    await discord.sendGaReport(report);
    console.log("Discord送信完了");

    console.log("\n=== GA Discord Bot 完了 ===");
  } catch (error) {
    console.error("エラーが発生しました:", error);

    // Discordにエラー通知
    try {
      await discord.sendError(error as Error);
    } catch (discordError) {
      console.error("Discordエラー通知に失敗:", discordError);
    }

    process.exit(1);
  }
}

main();
