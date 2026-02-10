/**
 * スマレジ現金売上記録Bot
 *
 * 1. 毎朝9時に前日の現金売上をGoogleスプレッドシートに自動記録
 * 2. Discordでメンション付きでメッセージを受信して手動記録
 */

import dotenv from "dotenv";
import cron from "node-cron";
import { SmaregiPlatformAuth } from "./smaregi-auth.js";
import { SmaregiClient } from "./smaregi-client.js";
import { SpreadsheetClient } from "./spreadsheet-client.js";
import { DiscordBot } from "./discord-bot.js";

dotenv.config();

// 環境変数の検証
function validateEnv() {
  const required = [
    "SMAREGI_CLIENT_ID",
    "SMAREGI_CLIENT_SECRET",
    "SMAREGI_CONTRACT_ID",
    "GOOGLE_SPREADSHEET_ID",
    "GOOGLE_SHEET_NAME",
    "GOOGLE_APPLICATION_CREDENTIALS",
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  // Discord Botモードの場合は追加の検証
  if (process.env.DISCORD_BOT_TOKEN) {
    console.log("Discord Botモードが有効です");
  }
}

/**
 * 前日の現金売上を記録
 */
async function recordYesterdayCashSales() {
  console.log("=== スマレジ現金売上記録開始 ===");

  try {
    // スマレジAPIクライアント初期化
    const auth = new SmaregiPlatformAuth({
      clientId: process.env.SMAREGI_CLIENT_ID!,
      clientSecret: process.env.SMAREGI_CLIENT_SECRET!,
      contractId: process.env.SMAREGI_CONTRACT_ID!,
      tokenFilePath: process.env.SMAREGI_TOKEN_FILE || "./.smaregi-token.json",
      useSandbox: process.env.SMAREGI_USE_SANDBOX === "true",
    });

    const smaregiClient = new SmaregiClient(auth);

    // Googleスプレッドシートクライアント初期化
    const spreadsheetClient = new SpreadsheetClient(
      process.env.GOOGLE_APPLICATION_CREDENTIALS!,
      process.env.GOOGLE_SPREADSHEET_ID!,
      process.env.GOOGLE_SHEET_NAME!
    );

    // JST時刻で前日の日付を計算
    const now = new Date();
    const jstOffset = 9 * 60;
    const nowJST = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60 * 1000);
    const yesterday = new Date(nowJST);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const dateStr = yesterday.toISOString().split("T")[0];
    console.log(`対象日: ${dateStr}`);

    // 現金売上データ取得
    const storeId = process.env.STORE_ID;
    console.log(`現金売上データ取得中... ${storeId ? `(店舗ID: ${storeId})` : "(全店舗)"}`);

    const cashSales = await smaregiClient.getCashSales(yesterday, storeId);
    console.log(`現金売上: ¥${cashSales.amount.toLocaleString()}`);

    // Googleスプレッドシートに記録
    await spreadsheetClient.appendRow({
      recordedAt: cashSales.recordedAt,
      date: cashSales.date,
      amount: cashSales.amount,
    });

    console.log("=== スマレジ現金売上記録完了 ===");
  } catch (error) {
    console.error("現金売上記録エラー:", error);
  }
}

/**
 * メイン処理
 */
async function main() {
  try {
    validateEnv();

    // コマンドライン引数をチェック
    const args = process.argv.slice(2);
    const runOnce = args.includes("--once");

    if (runOnce) {
      // 1回だけ実行（cronジョブ用）
      await recordYesterdayCashSales();
      process.exit(0);
    }

    // Googleスプレッドシートクライアント初期化（Discord Bot用）
    const spreadsheetClient = new SpreadsheetClient(
      process.env.GOOGLE_APPLICATION_CREDENTIALS!,
      process.env.GOOGLE_SPREADSHEET_ID!,
      process.env.GOOGLE_SHEET_NAME!
    );

    // Discord Botを起動
    if (process.env.DISCORD_BOT_TOKEN) {
      const discordBot = new DiscordBot(spreadsheetClient);
      await discordBot.start(process.env.DISCORD_BOT_TOKEN);
      console.log("Discord Bot起動完了");
    }

    // cronジョブをスケジュール（毎朝9時）
    cron.schedule("0 9 * * *", async () => {
      console.log("スケジュールされたタスクを実行します");
      await recordYesterdayCashSales();
    }, {
      timezone: "Asia/Tokyo"
    });

    console.log("スケジューラー起動完了（毎朝9時に実行）");

    // プロセスを維持
    console.log("Bot起動完了。常駐モードで実行中...");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
