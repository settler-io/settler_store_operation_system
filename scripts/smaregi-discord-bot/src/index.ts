/**
 * スマレジ日報Discord Bot
 *
 * 前日の取引履歴を取得して、商品ごとに集計してDiscordに投稿します。
 * 月曜日は自動的に前週（月〜日）のサマリーも送信します。
 *
 * 使用方法:
 *   npm run dev                         # 全店舗
 *   npm run dev -- --store=1            # 店舗ID 1のみ
 *   npm run start -- --store=1          # 本番実行（店舗ID指定）
 *   npm run start -- --store=1 --weekly # 前週のサマリーも含めて送信
 *   npm run start -- --store=1 -w       # 同上（短縮形）
 */

import "dotenv/config";
import { createSmaregiAuthFromEnv } from "./smaregi-auth.js";
import { SmaregiTransactions } from "./smaregi-transactions.js";
import { createDiscordWebhookFromEnv } from "./discord-webhook.js";

/**
 * コマンドライン引数から店舗IDを取得
 */
function getStoreIdFromArgs(): string | undefined {
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith("--store=")) {
      return arg.split("=")[1];
    }
    if (arg === "--store" || arg === "-s") {
      const index = args.indexOf(arg);
      if (index !== -1 && args[index + 1]) {
        return args[index + 1];
      }
    }
  }
  return undefined;
}

/**
 * コマンドライン引数から週次レポートフラグを取得
 */
function getWeeklyFlagFromArgs(): boolean {
  const args = process.argv.slice(2);
  return args.includes("--weekly") || args.includes("-w");
}

/**
 * 今日が月曜日かどうかを判定（日本時間基準）
 */
function isMonday(): boolean {
  const now = new Date();
  const jstOffset = 9 * 60; // JST is UTC+9
  const nowJST = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60 * 1000);
  return nowJST.getDay() === 1; // 1 = Monday
}

async function main(): Promise<void> {
  const storeId = getStoreIdFromArgs();
  const weeklyFlag = getWeeklyFlagFromArgs();
  const isMondayToday = isMonday();
  const shouldSendWeekly = isMondayToday || weeklyFlag;

  console.log("========================================");
  console.log("スマレジ日報Discord Bot 開始");
  console.log(`実行日時: ${new Date().toLocaleString("ja-JP")}`);
  if (storeId) {
    console.log(`店舗ID: ${storeId}`);
  } else {
    console.log("店舗: 全店舗");
  }
  if (shouldSendWeekly) {
    if (weeklyFlag) {
      console.log("📅 --weeklyオプション指定のため、前週のサマリーも送信します");
    } else {
      console.log("📅 本日は月曜日のため、前週のサマリーも送信します");
    }
  }
  console.log("========================================");

  const discord = createDiscordWebhookFromEnv();

  try {
    // スマレジAPI認証
    console.log("\n[1/4] スマレジAPI認証中...");
    const auth = createSmaregiAuthFromEnv();
    const transactions = new SmaregiTransactions(auth);

    // 前日の取引履歴取得
    console.log("[2/4] 前日の取引履歴を取得中...");
    const summary = await transactions.getYesterdaySummary(storeId);

    console.log(`  - 取引件数: ${summary.totalTransactions}件`);
    console.log(`  - 総売上: ¥${summary.totalAmount.toLocaleString("ja-JP")}`);
    console.log(`  - 商品種類: ${summary.products.length}種類`);

    // 週次サマリーが必要な場合は前週のサマリーも取得
    let weeklySummary: Awaited<ReturnType<typeof transactions.getLastWeekSummary>> | null = null;
    if (shouldSendWeekly) {
      console.log("[3/4] 前週の取引履歴を取得中...");
      weeklySummary = await transactions.getLastWeekSummary(storeId);

      console.log(`  - 取引件数: ${weeklySummary.totalTransactions}件`);
      console.log(`  - 総売上: ¥${weeklySummary.totalAmount.toLocaleString("ja-JP")}`);
      console.log(`  - 商品種類: ${weeklySummary.products.length}種類`);
    }

    // Discord送信
    console.log(`[${shouldSendWeekly ? "4/4" : "3/3"}] Discordに送信中...`);
    await discord.sendDailySummary(summary);

    if (shouldSendWeekly && weeklySummary) {
      console.log("  - 前週のサマリーを送信中...");
      await discord.sendWeeklySummary(weeklySummary);
    }

    console.log("\n========================================");
    console.log("処理完了");
    console.log("========================================");
  } catch (error) {
    console.error("\nエラーが発生しました:", error);

    // Discordにエラー通知
    try {
      await discord.sendError(error instanceof Error ? error : new Error(String(error)));
    } catch (discordError) {
      console.error("Discordへのエラー通知に失敗:", discordError);
    }

    process.exit(1);
  }
}

// 実行
main();
