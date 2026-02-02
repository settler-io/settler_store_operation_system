/**
 * X監視Bot
 * 指定したアカウントのポストを監視し、条件に応じてDiscordに通知する
 */

import dotenv from "dotenv";
import cron from "node-cron";
import { createXClientFromEnv } from "./x-client.js";
import { createDiscordWebhookFromEnv } from "./discord-webhook.js";
import { writeFileSync, appendFileSync, existsSync } from "fs";
import { join } from "path";

// 環境変数を読み込み
dotenv.config();

const KEYWORD = "店内状況";
const ACTIVE_HOURS = [17, 18, 19, 20, 21, 22]; // 17:00-22:00 JST
const WEEKDAYS = [1, 2, 3, 4, 5]; // 月〜金

// デバッグモード
const DEBUG_MODE = process.env.DEBUG_MODE === "true";
const DEBUG_TIME = process.env.DEBUG_TIME; // 例: "2026-02-03T18:30:00+09:00"

// ログディレクトリ
const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(
  LOG_DIR,
  `bot-${new Date().toISOString().split("T")[0]}.log`
);

/**
 * 現在時刻を取得（デバッグモード対応）
 */
function getCurrentTime(): Date {
  if (DEBUG_TIME) {
    const debugDate = new Date(DEBUG_TIME);
    console.log(`🐛 DEBUG MODE: Using time ${debugDate.toISOString()}`);
    return debugDate;
  }
  return new Date();
}

/**
 * JST時刻を取得
 */
function getJSTTime(date?: Date): Date {
  const targetDate = date || getCurrentTime();
  // JSTはUTC+9時間
  const jstOffset = 9 * 60; // 分単位
  const localOffset = targetDate.getTimezoneOffset(); // 分単位（ローカルタイムゾーンのオフセット）
  const offsetDiff = jstOffset + localOffset;

  const jstTime = new Date(targetDate.getTime() + offsetDiff * 60 * 1000);
  return jstTime;
}

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
 * 今が稼働時間かどうかをチェック（JST基準）
 */
function isActiveTime(): boolean {
  if (DEBUG_MODE) {
    log("🐛 DEBUG MODE: Skipping active time check");
    return true;
  }

  const now = getJSTTime();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  log(
    `Current JST time: ${now.toISOString()} (Hour: ${hour}, Day: ${dayOfWeek})`
  );

  // 平日かどうか
  if (!WEEKDAYS.includes(dayOfWeek)) {
    log(`Not a weekday (day: ${dayOfWeek})`);
    return false;
  }

  // 稼働時間かどうか
  if (!ACTIVE_HOURS.includes(hour)) {
    log(`Not in active hours (hour: ${hour})`);
    return false;
  }

  return true;
}

/**
 * 今日の0時0分0秒を取得（JST基準）
 */
function getTodayStart(): Date {
  const now = getJSTTime();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // JSTからUTCに戻す
  const jstOffset = 9 * 60; // 分単位
  const utcTime = new Date(today.getTime() - jstOffset * 60 * 1000);

  log(`Today's start (JST 00:00): ${today.toISOString()}`);
  log(`Today's start (UTC): ${utcTime.toISOString()}`);

  return utcTime;
}

/**
 * チェック処理を実行
 */
async function runCheck(): Promise<void> {
  log("=== Check started ===");

  // 稼働時間かチェック
  if (!isActiveTime()) {
    log("Not in active time (weekdays 17:00-22:00 JST), skipping check");
    return;
  }

  try {
    const xClient = createXClientFromEnv();
    const discord = createDiscordWebhookFromEnv();
    const roleId = process.env.DISCORD_ROLE_ID || "むさぽ神田メンバー";

    log("Fetching today's posts...");

    // 今日の投稿を取得
    const todayStart = getTodayStart();
    const posts = await xClient.getUserTweets(todayStart);

    log(`Found ${posts.length} posts today`);

    // デバッグモードの場合、全ポストを表示
    if (DEBUG_MODE) {
      posts.forEach((post, index) => {
        log(`🐛 Post ${index + 1}: [${post.createdAt.toISOString()}] ${post.text.substring(0, 50)}...`);
      });
    }

    // キーワードを含む投稿をフィルタリング
    const matchedPosts = xClient.filterPostsByKeyword(posts, KEYWORD);

    log(`Found ${matchedPosts.length} posts containing "${KEYWORD}"`);

    if (matchedPosts.length > 0) {
      // 投稿がある場合
      const message = `✅ ${KEYWORD}ポスト${matchedPosts.length}件されてます`;
      await discord.sendText(message);
      log(`Sent notification: ${message}`);
    } else {
      // 投稿がない場合
      // ロールIDが数値の場合は Discord メンション形式 <@&ID> を使用
      const mention = /^\d+$/.test(roleId) ? `<@&${roleId}>` : `@${roleId}`;
      const message = `⚠️ ${mention} まだ${KEYWORD}ポストされてないけど大丈夫？ https://634poker-kanda.com/waitinglist 入れるの忘れずに`;
      await discord.sendText(message);
      log(`Sent reminder: ${message}`);
    }
  } catch (error) {
    log(`Error occurred: ${error}`);
    console.error("Check failed:", error);

    try {
      const discord = createDiscordWebhookFromEnv();
      await discord.sendError(error as Error);
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
  log("X Reminder Bot started");
  log(`Monitoring keyword: "${KEYWORD}"`);
  log(
    `Active time: Weekdays ${ACTIVE_HOURS[0]}:00-${ACTIVE_HOURS[ACTIVE_HOURS.length - 1]}:59 JST`
  );
  log(`Check schedule: Every hour at 0 minutes (17:00, 18:00, 19:00, 20:00, 21:00, 22:00)`);

  if (DEBUG_MODE) {
    log("🐛 DEBUG MODE ENABLED");
  }
  if (DEBUG_TIME) {
    log(`🐛 DEBUG TIME: ${DEBUG_TIME}`);
  }

  log("---");

  // 起動時に即座に1回チェック
  await runCheck();

  // デバッグモードの場合は1回だけ実行して終了
  if (DEBUG_MODE) {
    log("🐛 DEBUG MODE: Single run completed, exiting...");
    process.exit(0);
  }

  // 毎時0分に実行（cronパターン: "0 * * * *"）
  // JSTタイムゾーンを指定
  cron.schedule(
    "0 * * * *",
    async () => {
      await runCheck();
    },
    {
      timezone: "Asia/Tokyo",
    }
  );

  log("Cron job scheduled. Bot will check every hour at 0 minutes (JST).");
  log("Waiting for next scheduled time...");
}

// 起動
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
