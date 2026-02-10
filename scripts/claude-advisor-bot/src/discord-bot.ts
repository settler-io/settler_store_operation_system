/**
 * Discord Bot（メンション受信 → Claude分析 → 返信）
 */

import { Client, GatewayIntentBits, Message } from "discord.js";
import { ClaudeAdvisorClient } from "./claude-client.js";
import { BigQueryAdvisorClient } from "./bigquery-client.js";

export class DiscordAdvisorBot {
  private client: Client;
  private claudeClient: ClaudeAdvisorClient;
  private bqClient: BigQueryAdvisorClient;

  constructor(claudeClient: ClaudeAdvisorClient, bqClient: BigQueryAdvisorClient) {
    this.claudeClient = claudeClient;
    this.bqClient = bqClient;

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
    });

    this.client.on("messageCreate", async (message: Message) => {
      try {
        await this.handleMessage(message);
      } catch (error) {
        console.error("未処理エラー (messageCreate):", error);
      }
    });

    // 未処理エラーでクラッシュしないようにする
    this.client.on("error", (error) => {
      console.error("Discord client error:", error);
    });
  }

  private async handleMessage(message: Message) {
    // Botメッセージは無視
    if (message.author.bot) return;

    // 特定のチャンネルでのみ反応（設定されている場合）
    const allowedChannelId = process.env.DISCORD_CHANNEL_ID;
    if (allowedChannelId && message.channelId !== allowedChannelId) return;

    // @everyone, @here は無視し、自分宛ての直接メンションのみに反応
    if (message.mentions.everyone) return;
    if (!message.mentions.users.has(this.client.user!.id)) return;

    // メンションを除去してメッセージ内容を取得
    const content = message.content.replace(/<@!?\d+>/g, "").trim();

    if (!content) {
      try {
        await message.reply("質問を入力してください。例: `@claude2 先週の売上を分析して`");
      } catch {
        // 元メッセージが削除済みの場合は無視
      }
      return;
    }

    console.log(`\n--- 質問受信 ---`);
    console.log(`User: ${message.author.username}`);
    console.log(`Question: ${content}`);

    // 「分析中」のメッセージを送信
    let thinkingMsg: Message | null = null;
    try {
      thinkingMsg = await message.reply("🤔 分析中です。少々お待ちください...");
    } catch {
      // 元メッセージが既に削除されている場合はチャンネルに直接送信
      try {
        thinkingMsg = await (message.channel as any).send("🤔 分析中です。少々お待ちください...");
      } catch {
        console.log("分析中メッセージの送信に失敗。処理は続行します。");
      }
    }

    try {
      // 過去の会話履歴を取得
      const recentHistory = await this.bqClient.getRecentConversations(20);
      const conversationHistory = recentHistory.map(entry => ({
        role: entry.role as "user" | "assistant",
        content: entry.content,
      }));

      // セッションIDを生成（日付ベース）
      const sessionId = new Date().toISOString().split("T")[0];

      // Claudeに質問
      const answer = await this.claudeClient.chat(content, conversationHistory);

      console.log(`Answer: ${answer.substring(0, 200)}...`);

      // 会話をBigQueryに保存
      const now = new Date().toISOString();
      try {
        await this.bqClient.saveConversation({
          session_id: sessionId,
          role: "user",
          content,
          created_at: now,
        });
        await this.bqClient.saveConversation({
          session_id: sessionId,
          role: "assistant",
          content: answer,
          created_at: new Date(Date.now() + 1000).toISOString(), // 1秒後
        });
      } catch (error) {
        console.error("会話履歴の保存に失敗:", error);
      }

      // 「分析中」メッセージを削除
      try { await thinkingMsg?.delete(); } catch {}

      // Discordの文字数制限（2000文字）に対応して分割送信
      await this.sendLongMessage(message, answer);
    } catch (error: any) {
      console.error("エラー:", error);

      const errorMsg = `❌ エラーが発生しました: ${error.message}`;
      try {
        if (thinkingMsg) {
          await thinkingMsg.edit(errorMsg);
        } else {
          await (message.channel as any).send(errorMsg);
        }
      } catch {
        // エラー通知も失敗した場合はログのみ
        console.error("エラー通知の送信にも失敗しました");
      }
    }
  }

  /**
   * 長いメッセージを分割して送信
   */
  private async sendLongMessage(message: Message, content: string) {
    const MAX_LENGTH = 2000;

    if (content.length <= MAX_LENGTH) {
      try {
        await message.reply(content);
      } catch {
        await (message.channel as any).send(content);
      }
      return;
    }

    // 段落や改行で分割
    const chunks: string[] = [];
    let remaining = content;

    while (remaining.length > 0) {
      if (remaining.length <= MAX_LENGTH) {
        chunks.push(remaining);
        break;
      }

      // 改行位置で分割を試みる
      let splitIndex = remaining.lastIndexOf("\n", MAX_LENGTH);
      if (splitIndex === -1 || splitIndex < MAX_LENGTH / 2) {
        // 改行が見つからない場合はスペースで分割
        splitIndex = remaining.lastIndexOf(" ", MAX_LENGTH);
      }
      if (splitIndex === -1 || splitIndex < MAX_LENGTH / 2) {
        splitIndex = MAX_LENGTH;
      }

      chunks.push(remaining.substring(0, splitIndex));
      remaining = remaining.substring(splitIndex).trimStart();
    }

    // 最初のチャンクはreplyで送信
    try {
      await message.reply(chunks[0]);
    } catch {
      await (message.channel as any).send(chunks[0]);
    }

    // 残りは通常メッセージとして送信
    for (let i = 1; i < chunks.length; i++) {
      await (message.channel as any).send(chunks[i]);
    }
  }

  async start(token: string) {
    await this.client.login(token);
  }

  async stop() {
    await this.client.destroy();
  }
}
