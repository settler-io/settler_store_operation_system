/**
 * Discord Webhook送信モジュール
 */

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  timestamp?: string;
}

interface DiscordWebhookPayload {
  content?: string;
  username?: string;
  embeds?: DiscordEmbed[];
}

export class DiscordWebhook {
  private webhookUrl: string;
  private username: string;

  constructor(webhookUrl: string, username: string = "X監視Bot") {
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
   * テキストメッセージを送信
   */
  async sendText(message: string): Promise<void> {
    await this.send({ content: message });
  }

  /**
   * エンベッドメッセージを送信
   */
  async sendEmbed(
    title: string,
    description: string,
    color: number = 0x5865f2
  ): Promise<void> {
    const embed: DiscordEmbed = {
      title,
      description,
      color,
      timestamp: new Date().toISOString(),
    };
    await this.send({ embeds: [embed] });
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

  const botName = process.env.DISCORD_BOT_NAME || "X監視Bot";

  return new DiscordWebhook(webhookUrl, botName);
}
