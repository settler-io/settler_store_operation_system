/**
 * Discord Bot（常駐型）
 * GMOあおぞらネット銀行の入出金明細をコマンドで取得・定時自動投稿
 */

import { Client, GatewayIntentBits, Message, TextChannel } from "discord.js";
import { GmoAozoraClient } from "./gmoaozora-client.js";
import { createTransactionEmbeds, createBalanceEmbed } from "./discord-webhook.js";

export class GmoAozoraDiscordBot {
  private client: Client;
  private gmoClient: GmoAozoraClient;
  private accountId: string;
  private autoPostChannelId: string | undefined;
  private dailyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(gmoClient: GmoAozoraClient, accountId: string) {
    this.gmoClient = gmoClient;
    this.accountId = accountId;
    this.autoPostChannelId = process.env.DISCORD_CHANNEL_ID || undefined;

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.once("ready", () => {
      console.log(`Discord Bot ready: ${this.client.user?.tag}`);
      this.scheduleDailyPost();
    });

    this.client.on("messageCreate", async (message: Message) => {
      await this.handleMessage(message);
    });
  }

  private async handleMessage(message: Message) {
    if (message.author.bot) return;
    if (message.mentions.everyone) return;
    if (!message.mentions.users.has(this.client.user!.id)) return;

    const content = message.content.replace(/<@!?\d+>/g, "").trim();

    try {
      if (content.includes("残高")) {
        await this.handleBalance(message);
      } else if (content.match(/入出金\s+(\d{4}-\d{2}-\d{2})\s+(\d{4}-\d{2}-\d{2})/)) {
        const match = content.match(/入出金\s+(\d{4}-\d{2}-\d{2})\s+(\d{4}-\d{2}-\d{2})/)!;
        await this.handleTransactions(message, match[1], match[2]);
      } else {
        // デフォルト: 前日の入出金
        await this.handleYesterdayTransactions(message);
      }
    } catch (error: any) {
      console.error("コマンド処理エラー:", error);
      await message.reply(`エラーが発生しました: ${error.message}`);
    }
  }

  /**
   * 前日の入出金明細を取得して返信
   */
  private async handleYesterdayTransactions(message: Message) {
    await message.react("🔄");

    const transactions = await this.gmoClient.getYesterdayTransactions(this.accountId);
    const yesterday = this.getJSTDateLabel(-1);
    const embeds = createTransactionEmbeds(transactions, yesterday);

    // 10件ずつ送信（Discord制限）
    for (let i = 0; i < embeds.length; i += 10) {
      const batch = embeds.slice(i, i + 10);
      if (i === 0) {
        await message.reply({ embeds: batch });
      } else {
        await (message.channel as TextChannel).send({ embeds: batch });
      }
    }

    await message.reactions.cache.get("🔄")?.users.remove(this.client.user!.id);
  }

  /**
   * 指定期間の入出金明細を取得して返信
   */
  private async handleTransactions(message: Message, dateFrom: string, dateTo: string) {
    await message.react("🔄");

    const transactions = await this.gmoClient.getTransactions(this.accountId, dateFrom, dateTo);
    const dateLabel = `${dateFrom} 〜 ${dateTo}`;
    const embeds = createTransactionEmbeds(transactions, dateLabel);

    for (let i = 0; i < embeds.length; i += 10) {
      const batch = embeds.slice(i, i + 10);
      if (i === 0) {
        await message.reply({ embeds: batch });
      } else {
        await (message.channel as TextChannel).send({ embeds: batch });
      }
    }

    await message.reactions.cache.get("🔄")?.users.remove(this.client.user!.id);
  }

  /**
   * 残高照会
   */
  private async handleBalance(message: Message) {
    await message.react("🔄");

    const balances = await this.gmoClient.getBalances(this.accountId);
    const embed = createBalanceEmbed(balances);
    await message.reply({ embeds: [embed] });

    await message.reactions.cache.get("🔄")?.users.remove(this.client.user!.id);
  }

  /**
   * 毎日JST 9:00 に前日の入出金明細を自動投稿
   */
  private scheduleDailyPost() {
    if (!this.autoPostChannelId) {
      console.log("DISCORD_CHANNEL_ID未設定のため、自動投稿はスキップ");
      return;
    }

    const scheduleNext = () => {
      const now = new Date();
      const jstOffset = 9 * 60;
      const jstNow = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60 * 1000);

      // 次の9:00 JSTまでのミリ秒を計算
      const target = new Date(jstNow);
      target.setHours(9, 0, 0, 0);
      if (jstNow >= target) {
        target.setDate(target.getDate() + 1);
      }

      // JSTからUTCに戻す
      const targetUTC = new Date(target.getTime() - (jstOffset + now.getTimezoneOffset()) * 60 * 1000);
      const msUntilTarget = targetUTC.getTime() - now.getTime();

      console.log(`次回自動投稿: ${target.toLocaleString("ja-JP")} JST (${Math.round(msUntilTarget / 1000 / 60)}分後)`);

      this.dailyTimer = setTimeout(async () => {
        try {
          await this.postDailyTransactions();
        } catch (error) {
          console.error("自動投稿エラー:", error);
        }
        scheduleNext();
      }, msUntilTarget);
    };

    scheduleNext();
  }

  /**
   * 前日の入出金明細を指定チャンネルに投稿
   */
  private async postDailyTransactions() {
    if (!this.autoPostChannelId) return;

    const channel = await this.client.channels.fetch(this.autoPostChannelId);
    if (!channel || !("send" in channel)) {
      console.error(`チャンネル ${this.autoPostChannelId} が見つからないか、送信不可`);
      return;
    }

    console.log("前日の入出金明細を自動投稿中...");
    const transactions = await this.gmoClient.getYesterdayTransactions(this.accountId);
    const yesterday = this.getJSTDateLabel(-1);
    const embeds = createTransactionEmbeds(transactions, yesterday);

    for (let i = 0; i < embeds.length; i += 10) {
      const batch = embeds.slice(i, i + 10);
      await (channel as TextChannel).send({ embeds: batch });
    }

    console.log(`自動投稿完了: ${transactions.length}件の明細`);
  }

  /**
   * JST日付のラベル (YYYY/MM/DD)
   */
  private getJSTDateLabel(offsetDays: number = 0): string {
    const now = new Date();
    const jstOffset = 9 * 60;
    const jst = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60 * 1000);
    jst.setDate(jst.getDate() + offsetDays);

    const year = jst.getFullYear();
    const month = String(jst.getMonth() + 1).padStart(2, "0");
    const day = String(jst.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  }

  /**
   * Bot起動
   */
  async start(token: string) {
    await this.client.login(token);
  }

  /**
   * Bot停止
   */
  async stop() {
    if (this.dailyTimer) {
      clearTimeout(this.dailyTimer);
    }
    this.client.destroy();
    console.log("Bot停止完了");
  }
}
