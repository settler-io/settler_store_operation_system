/**
 * Discord Webhook送信モジュール
 */

import {
  GaReport,
  DailyMetrics,
  PageMetrics,
  TrafficSource,
  DeviceCategory,
} from "./ga-client.js";

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

export class DiscordWebhook {
  private webhookUrl: string;
  private username: string;

  constructor(webhookUrl: string, username: string = "GA日報Bot") {
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
   * 数値をフォーマット
   */
  private formatNumber(num: number): string {
    return num.toLocaleString("ja-JP");
  }

  /**
   * 秒数を分:秒形式にフォーマット
   */
  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}分${secs}秒`;
  }

  /**
   * パーセンテージをフォーマット
   */
  private formatPercent(rate: number): string {
    return `${(rate * 100).toFixed(1)}%`;
  }

  /**
   * デバイス名を日本語化
   */
  private translateDevice(device: string): string {
    const translations: Record<string, string> = {
      desktop: "PC",
      mobile: "モバイル",
      tablet: "タブレット",
    };
    return translations[device.toLowerCase()] || device;
  }

  /**
   * GAレポートをDiscordに送信
   */
  async sendGaReport(report: GaReport): Promise<void> {
    // メインメトリクスEmbed（デバイス別含む）
    const mainEmbed = this.createMainEmbed(report.siteName, report.daily, report.devices);

    // ページEmbed
    const pagesEmbed = this.createPagesEmbed(report.topPages);

    // トラフィックソースEmbed
    const trafficEmbed = this.createTrafficEmbed(report.trafficSources);

    await this.send({
      embeds: [mainEmbed, pagesEmbed, trafficEmbed],
    });
  }

  /**
   * メインメトリクスEmbedを作成
   */
  private createMainEmbed(siteName: string, daily: DailyMetrics, devices: DeviceCategory[]): DiscordEmbed {
    // デバイス別の文字列を作成
    const totalSessions = devices.reduce((sum, d) => sum + d.sessions, 0);
    const deviceStr = devices.length > 0
      ? devices.map((d) => {
          const name = this.translateDevice(d.device);
          const percent = totalSessions > 0 ? ((d.sessions / totalSessions) * 100).toFixed(0) : "0";
          return `${name}: ${percent}%`;
        }).join(" / ")
      : "-";

    const titlePrefix = siteName ? `【${siteName}】` : "";
    return {
      title: `📊 ${titlePrefix}${daily.date} Google Analytics レポート`,
      color: 0x5865f2,
      fields: [
        {
          name: "👥 アクティブユーザー",
          value: this.formatNumber(daily.activeUsers),
          inline: true,
        },
        {
          name: "🆕 新規ユーザー",
          value: this.formatNumber(daily.newUsers),
          inline: true,
        },
        {
          name: "🔄 セッション数",
          value: this.formatNumber(daily.sessions),
          inline: true,
        },
        {
          name: "📄 ページビュー",
          value: this.formatNumber(daily.screenPageViews),
          inline: true,
        },
        {
          name: "⏱️ 平均セッション時間",
          value: this.formatDuration(daily.averageSessionDuration),
          inline: true,
        },
        {
          name: "📈 エンゲージメント率",
          value: this.formatPercent(daily.engagementRate),
          inline: true,
        },
        {
          name: "📱 デバイス別",
          value: deviceStr,
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * トップページEmbedを作成
   */
  private createPagesEmbed(pages: PageMetrics[]): DiscordEmbed {
    if (pages.length === 0) {
      return {
        title: "📄 人気ページ TOP10",
        description: "データがありませんでした。",
        color: 0x57f287,
      };
    }

    const lines = pages.map((page, index) => {
      const title = page.pageTitle || "(タイトルなし)";
      return `${index + 1}. **${title}**\n\`${page.pagePath}\` - PV: ${this.formatNumber(page.screenPageViews)} / ユーザー: ${this.formatNumber(page.activeUsers)}`;
    });

    return {
      title: "📄 人気ページ TOP10",
      description: lines.join("\n\n"),
      color: 0x57f287,
    };
  }

  /**
   * トラフィックソースEmbedを作成
   */
  private createTrafficEmbed(sources: TrafficSource[]): DiscordEmbed {
    if (sources.length === 0) {
      return {
        title: "🌐 トラフィックソース",
        description: "データがありませんでした。",
        color: 0xfee75c,
      };
    }

    const lines = sources.map((source) => {
      const sourceName =
        source.source === "(direct)" ? "ダイレクト" : source.source;
      const mediumName = source.medium === "(none)" ? "-" : source.medium;
      return `**${sourceName} / ${mediumName}** - セッション: ${this.formatNumber(source.sessions)} / ユーザー: ${this.formatNumber(source.activeUsers)}`;
    });

    return {
      title: "🌐 トラフィックソース",
      description: lines.join("\n\n"),
      color: 0xfee75c,
    };
  }

  /**
   * デバイスカテゴリEmbedを作成
   */
  private createDevicesEmbed(devices: DeviceCategory[]): DiscordEmbed {
    if (devices.length === 0) {
      return {
        title: "📱 デバイス別",
        description: "データがありませんでした。",
        color: 0xeb459e,
      };
    }

    const totalSessions = devices.reduce((sum, d) => sum + d.sessions, 0);

    const lines = devices.map((device) => {
      const deviceName = this.translateDevice(device.device);
      const percent =
        totalSessions > 0
          ? ((device.sessions / totalSessions) * 100).toFixed(1)
          : "0";
      return `**${deviceName}** - ${percent}%\n　　セッション: ${this.formatNumber(device.sessions)} / ユーザー: ${this.formatNumber(device.activeUsers)}`;
    });

    return {
      title: "📱 デバイス別",
      description: lines.join("\n\n"),
      color: 0xeb459e,
    };
  }

  /**
   * エラー通知を送信
   */
  async sendError(error: Error): Promise<void> {
    const embed: DiscordEmbed = {
      title: "❌ エラーが発生しました",
      description: `\`\`\`\n${error.message}\n\`\`\``,
      color: 0xed4245,
      timestamp: new Date().toISOString(),
    };

    await this.send({ embeds: [embed] });
  }
}

/**
 * 環境変数からDiscordWebhookインスタンスを作成
 */
export function createDiscordWebhookFromEnv(): DiscordWebhook {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error(
      "Missing required environment variable: DISCORD_WEBHOOK_URL"
    );
  }

  const botName = process.env.DISCORD_BOT_NAME || "GA日報Bot";

  return new DiscordWebhook(webhookUrl, botName);
}
