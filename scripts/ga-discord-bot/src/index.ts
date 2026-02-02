/**
 * Google Analytics Discord Bot
 * 前日のGA4データを取得してDiscordに投稿する
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { GaClient, SiteConfig } from "./ga-client.js";
import { createDiscordWebhookFromEnv } from "./discord-webhook.js";

function loadSites(): SiteConfig[] {
  try {
    const data = readFileSync("./sites.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("sites.json の読み込みに失敗しました:", error);
    throw error;
  }
}

async function main(): Promise<void> {
  console.log("=== GA Discord Bot 開始 ===");
  console.log(`実行時刻: ${new Date().toISOString()}`);

  const discord = createDiscordWebhookFromEnv();
  const sites = loadSites();
  console.log(`${sites.length} サイトの設定を読み込みました`);

  let hasError = false;

  for (const site of sites) {
    console.log(`\n--- ${site.name} (${site.propertyId}) ---`);

    try {
      // GA クライアント作成
      const gaClient = new GaClient(site.propertyId, site.name);

      // 前日のレポートを取得
      console.log("前日のレポートを取得中...");
      const report = await gaClient.getYesterdayReport();
      console.log(`レポート取得完了: ${report.daily.date}`);

      // サマリー出力
      console.log(`アクティブユーザー: ${report.daily.activeUsers}`);
      console.log(`新規ユーザー: ${report.daily.newUsers}`);
      console.log(`セッション数: ${report.daily.sessions}`);
      console.log(`ページビュー: ${report.daily.screenPageViews}`);

      // Discordに送信
      console.log("Discordにレポートを送信中...");
      await discord.sendGaReport(report);
      console.log("Discord送信完了");
    } catch (error) {
      console.error(`${site.name} でエラーが発生しました:`, error);
      hasError = true;

      // Discordにエラー通知
      try {
        await discord.sendError(
          new Error(`【${site.name}】${(error as Error).message}`)
        );
      } catch (discordError) {
        console.error("Discordエラー通知に失敗:", discordError);
      }
    }
  }

  console.log("\n=== GA Discord Bot 完了 ===");

  if (hasError) {
    process.exit(1);
  }
}

main();
