/**
 * Discord Webhook送信モジュール（タイムカード専用）
 */

import type { DailyPayrollSummary } from "./types.js";

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
}

interface DiscordWebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
}

export class TimecardDiscordWebhook {
  private webhookUrl: string;
  private username: string;

  constructor(webhookUrl: string, username: string = "スマレジタイムカードBot") {
    this.webhookUrl = webhookUrl;
    this.username = username;
  }

  /**
   * メッセージを送信
   */
  async send(payload: DiscordWebhookPayload): Promise<void> {
    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: this.username,
        ...payload,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to send Discord message: ${response.status} ${response.statusText} - ${errorText}`
      );
    }
  }

  /**
   * 金額をフォーマット
   */
  private formatCurrency(amount: number): string {
    return `¥${amount.toLocaleString("ja-JP")}`;
  }

  /**
   * 時間をフォーマット（分 → X時間Y分）
   */
  private formatMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}時間${minutes}分`;
  }

  /**
   * 日次給与サマリーをDiscordに送信
   */
  async sendDailyPayrollSummary(summary: DailyPayrollSummary): Promise<void> {
    // データがない場合
    if (summary.totalStaff === 0) {
      const embed: DiscordEmbed = {
        title: `💰 ${summary.date} 給与レポート`,
        description: "勤務データがありませんでした。",
        color: 0xf39c12, // Orange
        timestamp: new Date().toISOString(),
      };
      await this.send({ embeds: [embed] });
      return;
    }

    // メインサマリーフィールド
    const summaryFields: { name: string; value: string; inline: boolean }[] = [
      {
        name: "👥 勤務従業員数",
        value: `${summary.totalStaff}人`,
        inline: true,
      },
      {
        name: "⏰ 総労働時間",
        value: `${this.formatMinutes(summary.totalMinutes)} (${summary.totalMinutes}分)`,
        inline: true,
      },
      {
        name: "💵 総給与額",
        value: this.formatCurrency(summary.totalPayroll),
        inline: true,
      },
      {
        name: "📊 平均時給",
        value: this.formatCurrency(summary.averageHourlyWage) + "/時間",
        inline: true,
      },
    ];

    // 従業員別内訳を作成（最大20人まで表示）
    const staffLines: string[] = [];
    const displayLimit = 20;
    const staffsToDisplay = summary.staffPayrolls.slice(0, displayLimit);

    for (const staff of staffsToDisplay) {
      const hours = Math.floor(staff.workingMinutes / 60);
      const minutes = staff.workingMinutes % 60;
      const timeStr = `${hours}時間${minutes}分`;
      staffLines.push(
        `・${staff.staffName} - ${timeStr} / ${this.formatCurrency(staff.payAmount)}`
      );
    }

    // 表示しきれなかった従業員数
    const remainingStaff = summary.staffPayrolls.length - displayLimit;
    if (remainingStaff > 0) {
      staffLines.push(`\n...他${remainingStaff}人`);
    }

    // Embed作成
    const embed: DiscordEmbed = {
      title: `💰 ${summary.date} 給与レポート`,
      color: 0xf39c12, // Orange
      fields: summaryFields,
      timestamp: new Date().toISOString(),
    };

    // 従業員別内訳を別のEmbedとして送信
    const staffEmbed: DiscordEmbed = {
      title: "👤 従業員別内訳",
      description: staffLines.join("\n") || "データがありません。",
      color: 0x3498db, // Blue
      footer: { text: "※ 給与額は概算値です" },
    };

    await this.send({ embeds: [embed, staffEmbed] });
  }

  /**
   * エラー通知を送信
   */
  async sendError(error: Error): Promise<void> {
    const embed: DiscordEmbed = {
      title: "❌ エラーが発生しました",
      description: `\`\`\`\n${error.message}\n\`\`\``,
      color: 0xed4245, // Discord Red
      timestamp: new Date().toISOString(),
    };

    await this.send({ embeds: [embed] });
  }

  /**
   * 環境変数からTimecardDiscordWebhookインスタンスを作成
   */
  static createFromEnv(): TimecardDiscordWebhook {
    const webhookUrl = process.env.TIMECARD_DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      throw new Error(
        "Missing required environment variable: TIMECARD_DISCORD_WEBHOOK_URL"
      );
    }

    const botName = process.env.DISCORD_BOT_NAME || "スマレジタイムカードBot";

    return new TimecardDiscordWebhook(webhookUrl, botName);
  }
}
