/**
 * スマレジタイムカードBot
 *
 * 前日の従業員給与データを取得して、Discordに投稿します。
 *
 * 使用方法:
 *   npm run dev                         # デフォルト店舗ID（環境変数）
 *   npm run dev -- --store=2            # 店舗ID 2を指定
 *   npm run start -- --store=2          # 本番実行
 */

import "dotenv/config";
import { createSmaregiAuthFromEnv } from "./smaregi-auth.js";
import { TimecardClient } from "./timecard-client.js";
import { TimecardDiscordWebhook } from "./discord-webhook.js";

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
 * コマンドライン引数から全店舗フラグを取得
 */
function getAllStoresFlag(): boolean {
  const args = process.argv.slice(2);
  return args.includes("--all-stores") || args.includes("-a");
}

async function main(): Promise<void> {
  // 店舗IDまたは全店舗フラグを取得
  const storeId = getStoreIdFromArgs();
  const allStoresFlag = getAllStoresFlag();
  const storeIds: string[] = [];

  if (allStoresFlag) {
    // 全店舗の場合、環境変数から店舗IDリストを取得
    const storeIdsEnv = process.env.STORE_IDS || process.env.STORE_ID || "2";
    storeIds.push(...storeIdsEnv.split(",").map((id) => id.trim()));
  } else if (storeId) {
    storeIds.push(storeId);
  } else {
    // デフォルトは環境変数のSTORE_ID
    const defaultStoreId = process.env.STORE_ID;
    if (!defaultStoreId) {
      throw new Error(
        "店舗IDが指定されていません。--store=ID、--all-stores オプション、または STORE_ID 環境変数を設定してください。"
      );
    }
    storeIds.push(defaultStoreId);
  }

  console.log("========================================");
  console.log("スマレジタイムカードBot 開始");
  console.log(`実行日時: ${new Date().toLocaleString("ja-JP")}`);
  if (allStoresFlag) {
    console.log(`店舗: 全店舗 (${storeIds.join(", ")})`);
  } else {
    console.log(`店舗ID: ${storeIds.join(", ")}`);
  }
  console.log("========================================");

  const discord = TimecardDiscordWebhook.createFromEnv();

  try {
    // スマレジAPI認証
    console.log("\n[1/3] スマレジAPI認証中...");
    const auth = createSmaregiAuthFromEnv();
    const timecardClient = new TimecardClient(auth);

    // 前日のタイムカードデータ取得
    console.log("[2/3] 前日の給与データを取得中...");
    const summaries = await Promise.all(
      storeIds.map((id) => timecardClient.getYesterdayPayrollSummary(id))
    );

    // 複数店舗のデータを集計
    const mergedSummary = timecardClient.mergeSummaries(summaries);

    console.log(`  - 勤務従業員数: ${mergedSummary.totalStaff}人`);
    console.log(`  - 総労働時間: ${mergedSummary.totalHours}時間 (${mergedSummary.totalMinutes}分)`);
    console.log(`  - 総給与額: ¥${mergedSummary.totalPayroll.toLocaleString("ja-JP")}`);
    console.log(`  - 平均時給: ¥${mergedSummary.averageHourlyWage.toLocaleString("ja-JP")}/時間`);

    // Discord送信
    console.log("[3/3] Discordに送信中...");
    await discord.sendDailyPayrollSummary(mergedSummary);

    console.log("\n========================================");
    console.log("処理完了");
    console.log("========================================");
  } catch (error) {
    console.error("\nエラーが発生しました:", error);

    // Discordにエラー通知
    try {
      await discord.sendError(
        error instanceof Error ? error : new Error(String(error))
      );
    } catch (discordError) {
      console.error("Discordへのエラー通知に失敗:", discordError);
    }

    process.exit(1);
  }
}

// 実行
main();
