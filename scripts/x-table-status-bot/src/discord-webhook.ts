/**
 * Discord Webhook クライアント
 * エラー通知用
 */

export class DiscordWebhook {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    if (!webhookUrl) {
      throw new Error("Discord webhook URL is required");
    }
    this.webhookUrl = webhookUrl;
  }

  /**
   * テキストメッセージを送信
   */
  async sendText(text: string): Promise<void> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Discord webhook error: ${response.status} ${response.statusText}\n${errorText}`
        );
      }

      console.log("Discord message sent successfully");
    } catch (error) {
      console.error("Failed to send Discord message:", error);
      throw error;
    }
  }

  /**
   * エラーメッセージを送信
   */
  async sendError(error: Error): Promise<void> {
    const message = `❌ **Error in x-table-status-bot**\n\`\`\`\n${error.message}\n${error.stack}\n\`\`\``;
    await this.sendText(message);
  }
}

/**
 * 環境変数からDiscord Webhookクライアントを作成
 */
export function createDiscordWebhookFromEnv(): DiscordWebhook | null {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("Discord webhook URL not configured, error notifications will be disabled");
    return null;
  }

  return new DiscordWebhook(webhookUrl);
}
