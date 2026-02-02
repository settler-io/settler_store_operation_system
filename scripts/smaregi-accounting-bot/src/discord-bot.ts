/**
 * Discord Botクライアント
 */

import { Client, GatewayIntentBits, Message } from "discord.js";
import { parseMessage, isValidDate } from "./message-parser.js";
import { SpreadsheetClient } from "./spreadsheet-client.js";

export class DiscordBot {
  private client: Client;
  private spreadsheetClient: SpreadsheetClient;

  constructor(spreadsheetClient: SpreadsheetClient) {
    this.spreadsheetClient = spreadsheetClient;

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.setupEventHandlers();
  }

  /**
   * イベントハンドラーを設定
   */
  private setupEventHandlers() {
    this.client.once("ready", () => {
      console.log(`Discord Bot ready: ${this.client.user?.tag}`);
    });

    this.client.on("messageCreate", async (message: Message) => {
      await this.handleMessage(message);
    });
  }

  /**
   * メッセージを処理
   */
  private async handleMessage(message: Message) {
    // Botメッセージは無視
    if (message.author.bot) {
      return;
    }

    // 特定のチャンネルでのみ反応
    const allowedChannelId = process.env.DISCORD_CHANNEL_ID;
    if (allowedChannelId && message.channelId !== allowedChannelId) {
      return;
    }

    // メンションされているかチェック
    if (!message.mentions.has(this.client.user!)) {
      return;
    }

    // メンションを除去してメッセージ内容を取得
    const content = message.content
      .replace(/<@!?\d+>/g, "") // メンションを削除
      .trim();

    console.log(`受信メッセージ: "${content}"`);

    // メッセージを解析
    const parsed = parseMessage(content);

    if (!parsed) {
      await message.reply(
        "メッセージのフォーマットが正しくありません。\n" +
        "使用例:\n" +
        "- `@会計くん 2026-02-02 15600`\n" +
        "- `@会計くん 02-02 15600`"
      );
      return;
    }

    // 日付の妥当性をチェック
    if (!isValidDate(parsed.date)) {
      await message.reply(`無効な日付です: ${parsed.date}`);
      return;
    }

    // 金額の妥当性をチェック
    if (parsed.amount <= 0 || !Number.isInteger(parsed.amount)) {
      await message.reply(`無効な金額です: ${parsed.amount}`);
      return;
    }

    try {
      // JSTで現在時刻を取得
      const now = new Date();
      const jstOffset = 9 * 60;
      const nowJST = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60 * 1000);

      // スプレッドシートに記録（金額はマイナスで記録）
      await this.spreadsheetClient.appendRow({
        recordedAt: nowJST.toISOString(),
        date: parsed.date,
        amount: -parsed.amount,
      });

      console.log(`スプレッドシートに記録: ${parsed.date} - ¥${-parsed.amount}`);

      await message.reply(
        `記録しました\n` +
        `発生日: ${parsed.date}\n` +
        `金額: ¥${(-parsed.amount).toLocaleString()}`
      );
    } catch (error) {
      console.error("スプレッドシートへの記録エラー:", error);
      await message.reply("スプレッドシートへの記録に失敗しました。");
    }
  }

  /**
   * Botを起動
   */
  async start(token: string) {
    await this.client.login(token);
  }

  /**
   * Botを停止
   */
  async stop() {
    await this.client.destroy();
  }
}
