/**
 * X Table Status Bot
 * テーブルの使用状況を取得してXに投稿するボット
 */

import dotenv from "dotenv";
import cron from "node-cron";
import JapaneseHolidays from "japanese-holidays";
import { createGASClientFromEnv } from "./gas-client.js";
import { createXClientFromEnv } from "./x-client.js";
import { createDiscordWebhookFromEnv } from "./discord-webhook.js";
import { loadState, saveState } from "./state-storage.js";
import { appendFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// 環境変数を読み込み
dotenv.config();

// 投稿時刻（JST）
const WEEKDAY_POST_HOURS = [16, 18, 19, 20, 21]; // 平日（月〜金）
const WEEKEND_POST_HOURS = [14, 16, 18, 20]; // 土日祝日
const WEEKDAYS = [1, 2, 3, 4, 5]; // 月〜金

// デバッグモード
const DEBUG_MODE = process.env.DEBUG_MODE === "true";
const SCREENSHOT_ONLY = process.env.SCREENSHOT_ONLY === "true";

// Waiting list URL
const WAITING_LIST_URL =
  process.env.WAITING_LIST_URL ||
  "https://634poker-kanda.com/waitinglist?utm_source=x&utm_medium=social&utm_campaign=permanent&utm_content=profile";

// ログディレクトリ
const LOG_DIR = join(process.cwd(), "logs");
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}
const LOG_FILE = join(
  LOG_DIR,
  `bot-${new Date().toISOString().split("T")[0]}.log`
);

/**
 * ログを出力
 */
function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());

  try {
    appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.error("Failed to write log:", error);
  }
}

/**
 * JST時刻を取得
 */
function getJSTTime(date?: Date): Date {
  const targetDate = date || new Date();
  const jstOffset = 9 * 60;
  const localOffset = targetDate.getTimezoneOffset();
  const offsetDiff = jstOffset + localOffset;
  const jstTime = new Date(targetDate.getTime() + offsetDiff * 60 * 1000);
  return jstTime;
}

/**
 * 今が投稿時間かどうかをチェック（JST基準）
 */
function isPostTime(): boolean {
  if (DEBUG_MODE) {
    log("🐛 DEBUG MODE: Skipping post time check");
    return true;
  }

  const now = getJSTTime();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  log(
    `Current JST time: ${now.toISOString()} (Hour: ${hour}, Day: ${dayOfWeek})`
  );

  // 祝日かどうかをチェック
  const isHoliday = JapaneseHolidays.isHoliday(now);

  // 土日または祝日の場合
  if (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) {
    const dayType = isHoliday ? "holiday" : "weekend";
    log(`Weekend/Holiday detected (${dayType}), checking weekend hours`);

    if (!WEEKEND_POST_HOURS.includes(hour)) {
      log(`Not in weekend post hours (hour: ${hour})`);
      return false;
    }

    log(`Weekend/Holiday post time confirmed (hour: ${hour})`);
    return true;
  }

  // 平日（月〜金）の場合
  log(`Weekday detected, checking weekday hours`);

  if (!WEEKDAY_POST_HOURS.includes(hour)) {
    log(`Not in weekday post hours (hour: ${hour})`);
    return false;
  }

  log(`Weekday post time confirmed (hour: ${hour})`);
  return true;
}

/**
 * 投稿メッセージを作成
 */
function createPostMessage(formattedStatus: string): string {
  const now = getJSTTime();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  let message = `♣️店内状況♣️\n${hours}:${minutes}時点\n\n`;

  if (formattedStatus) {
    message += `${formattedStatus}\n\nで進行中です🔥\n\n`;
  } else {
    message += `現在、進行中のテーブルはありません\n\n`;
  }

  message += `本日のイベント&リアルタイム卓状況 👉 https://x.gd/QygYb\n\n`;
  message += `ご来店お待ちしております！`;

  return message;
}

/**
 * チェック処理を実行
 */
async function runCheck(): Promise<void> {
  log("=== Check started ===");

  // スクリーンショットのみモード（時間チェックをスキップ）
  if (SCREENSHOT_ONLY) {
    try {
      log("📸 SCREENSHOT ONLY MODE");
      const xClient = createXClientFromEnv();

      log("Capturing screenshot of waiting list...");
      const screenshot = await xClient.captureScreenshot(WAITING_LIST_URL);

      // スクリーンショットをファイルに保存
      const { writeFileSync } = await import("fs");
      const screenshotPath = join(
        process.cwd(),
        `screenshot-${new Date().toISOString().replace(/:/g, "-")}.png`
      );
      writeFileSync(screenshotPath, screenshot);
      log(`Screenshot saved to: ${screenshotPath}`);

      await xClient.closeBrowser();
    } catch (error) {
      log(`Error occurred: ${error}`);
      console.error("Screenshot capture failed:", error);
    }
    log("=== Check completed ===\n");
    return;
  }

  // 投稿時間かチェック
  if (!isPostTime()) {
    log(
      `Not in post time (weekdays ${WEEKDAY_POST_HOURS.join(", ")}:00, weekends/holidays ${WEEKEND_POST_HOURS.join(", ")}:00 JST), skipping check`
    );
    return;
  }

  try {

    const gasClient = createGASClientFromEnv();
    const xClient = createXClientFromEnv();
    const discord = createDiscordWebhookFromEnv();

    log("Fetching table status...");

    // テーブル状況を取得
    const currentStatus = await gasClient.getTableStatus();

    // すべてのテーブルが空（["0"]）かチェック
    // 空文字列キーを除外して、すべてのテーブルの状態を確認
    const allTablesEmpty = Object.entries(currentStatus).every(
      ([tableName, counts]) => {
        // 空のキー""は無視
        if (tableName === "") return true;

        const count = counts?.[0] || "0";
        return count === "0";
      }
    );

    if (allTablesEmpty) {
      log("All tables are empty (no active games), skipping post");
      return;
    }

    // 前回の状態を読み込み
    const previousState = loadState();
    const previousStatus = previousState?.lastTableStatus || null;

    // 変更があるかチェック
    const hasChanged = gasClient.hasChanged(previousStatus, currentStatus);

    if (!hasChanged && !DEBUG_MODE) {
      log("Table status has not changed, skipping post");
      return;
    }

    log("Table status has changed or first run, posting to X...");

    // テーブル状況を人間が読める形式に変換
    const formattedStatus = gasClient.formatTableStatus(currentStatus);
    log(`Formatted status:\n${formattedStatus || "(no active tables)"}`);

    // 投稿メッセージを作成
    const postMessage = createPostMessage(formattedStatus);
    log(`Post message:\n${postMessage}`);

    // Waiting listのスクリーンショットを取得
    log("Capturing screenshot of waiting list...");
    const screenshot = await xClient.captureScreenshot(WAITING_LIST_URL);
    log("Screenshot captured successfully");

    // Xに投稿
    log("Posting to X...");
    await xClient.postTweet(postMessage, screenshot);
    log("Posted to X successfully!");

    // 状態を保存
    saveState(currentStatus);

    // ブラウザを閉じる
    await xClient.closeBrowser();
  } catch (error) {
    log(`Error occurred: ${error}`);
    console.error("Check failed:", error);

    try {
      const discord = createDiscordWebhookFromEnv();
      if (discord) {
        await discord.sendError(error as Error);
      }
    } catch (discordError) {
      log(`Failed to send error notification to Discord: ${discordError}`);
    }
  }

  log("=== Check completed ===\n");
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  log("X Table Status Bot started");
  log(
    `Post schedule: Weekdays at ${WEEKDAY_POST_HOURS.join(", ")}:00 JST, Weekends/Holidays at ${WEEKEND_POST_HOURS.join(", ")}:00 JST`
  );
  log(`Waiting list URL: ${WAITING_LIST_URL}`);

  if (DEBUG_MODE) {
    log("🐛 DEBUG MODE ENABLED");
  }

  log("---");

  // 起動時に即座に1回チェック
  await runCheck();

  // デバッグモードの場合は1回だけ実行して終了
  if (DEBUG_MODE) {
    log("🐛 DEBUG MODE: Single run completed, exiting...");
    process.exit(0);
  }

  // スクリーンショットのみモードの場合も1回だけ実行して終了
  if (SCREENSHOT_ONLY) {
    log("📸 SCREENSHOT ONLY MODE: Single run completed, exiting...");
    process.exit(0);
  }

  // 平日の16:00, 18:00, 19:00, 20:00, 21:00に実行
  // cronパターン: "0 16,18,19,20,21 * * 1-5" (月〜金)
  cron.schedule(
    "0 16,18,19,20,21 * * 1-5",
    async () => {
      await runCheck();
    },
    {
      timezone: "Asia/Tokyo",
    }
  );

  // 土日の14:00, 16:00, 18:00, 20:00に実行
  // cronパターン: "0 14,16,18,20 * * 0,6" (日、土)
  cron.schedule(
    "0 14,16,18,20 * * 0,6",
    async () => {
      await runCheck();
    },
    {
      timezone: "Asia/Tokyo",
    }
  );

  log(
    `Cron jobs scheduled. Bot will check at specified times (weekdays: ${WEEKDAY_POST_HOURS.join(", ")}:00, weekends/holidays: ${WEEKEND_POST_HOURS.join(", ")}:00 JST).`
  );
  log("Waiting for next scheduled time...");
}

// 起動
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
