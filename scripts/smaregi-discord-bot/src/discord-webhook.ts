/**
 * Discord Webhook送信モジュール
 */

import { DailySummary, ProductSummary, CustomerSummary } from "./smaregi-transactions.js";

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

  constructor(webhookUrl: string, username: string = "スマレジ日報Bot") {
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
   * 週次サマリーをDiscordに送信（商品別売上・顧客リストは含まない）
   */
  async sendWeeklySummary(summary: DailySummary): Promise<void> {
    // 顧客サマリー統計を計算
    let unknownCount = 0;
    let oneVisitCount = 0;
    let twoVisitCount = 0;
    let memberCount = 0;

    for (const c of summary.customers) {
      if (!c.customerCode) {
        unknownCount++;
      } else {
        memberCount++;
        if (c.visitCount === 1) {
          oneVisitCount++;
        } else if (c.visitCount === 2) {
          twoVisitCount++;
        }
      }
    }

    const totalCustomerCount = memberCount + unknownCount;

    // 売上フィールドを構築（指定された順番）
    const salesFields: { name: string; value: string; inline: boolean }[] = [
      {
        name: "取引件数",
        value: `${summary.totalTransactions}件`,
        inline: true,
      },
      {
        name: "総販売数量",
        value: `${summary.totalQuantity}点`,
        inline: true,
      },
      {
        name: "総売上",
        value: this.formatCurrency(summary.totalAmount),
        inline: true,
      },
      {
        name: "💰 純売上",
        value: this.formatCurrency(summary.sales.netSales),
        inline: true,
      },
      {
        name: "💵 現金売上",
        value: this.formatCurrency(summary.sales.cashSales),
        inline: true,
      },
      {
        name: "💳 クレジット売上",
        value: this.formatCurrency(summary.sales.creditSales),
        inline: true,
      },
      {
        name: "📱 PAYGATE",
        value: this.formatCurrency(summary.sales.paygateSales),
        inline: true,
      },
    ];

    // 顧客統計フィールドを追加
    if (totalCustomerCount > 0) {
      salesFields.push({
        name: "👥 総来店数",
        value: `${totalCustomerCount}人`,
        inline: true,
      });

      if (unknownCount > 0) {
        const unknownRatio = Math.round((unknownCount / totalCustomerCount) * 100);
        salesFields.push({
          name: "❓ Unknown数",
          value: `${unknownCount}人 (${unknownRatio}%)`,
          inline: true,
        });
      }

      if (oneVisitCount > 0) {
        const oneVisitRatio = Math.round((oneVisitCount / totalCustomerCount) * 100);
        salesFields.push({
          name: "🔰 過去3ヶ月間来店1回",
          value: `${oneVisitCount}人 (${oneVisitRatio}%)`,
          inline: true,
        });
      }

      if (twoVisitCount > 0) {
        const twoVisitRatio = Math.round((twoVisitCount / totalCustomerCount) * 100);
        salesFields.push({
          name: "2️⃣ 過去3ヶ月間来店2回",
          value: `${twoVisitCount}人 (${twoVisitRatio}%)`,
          inline: true,
        });
      }
    }

    // メインのサマリーEmbed
    const mainEmbed: DiscordEmbed = {
      title: `📅 ${summary.date} 週次売上レポート`,
      color: 0x9b59b6, // Purple for weekly report
      fields: salesFields,
      footer: { text: "※来店数は重複許容（延べ人数）" },
      timestamp: new Date().toISOString(),
    };

    // メインのサマリーのみを送信（商品別売上・顧客リストは含まない）
    await this.send({ embeds: [mainEmbed] });
  }

  /**
   * 日次サマリーをDiscordに送信
   */
  async sendDailySummary(summary: DailySummary): Promise<void> {
    // 売上フィールドを構築（指定された順番）
    const salesFields: { name: string; value: string; inline: boolean }[] = [
      {
        name: "取引件数",
        value: `${summary.totalTransactions}件`,
        inline: true,
      },
      {
        name: "総販売数量",
        value: `${summary.totalQuantity}点`,
        inline: true,
      },
      {
        name: "総売上",
        value: this.formatCurrency(summary.totalAmount),
        inline: true,
      },
      {
        name: "💰 純売上",
        value: this.formatCurrency(summary.sales.netSales),
        inline: true,
      },
      {
        name: "💵 現金売上",
        value: this.formatCurrency(summary.sales.cashSales),
        inline: true,
      },
      {
        name: "💳 クレジット売上",
        value: this.formatCurrency(summary.sales.creditSales),
        inline: true,
      },
      {
        name: "📱 PAYGATE",
        value: this.formatCurrency(summary.sales.paygateSales),
        inline: true,
      },
      {
        name: "🏦 銀行預入金",
        value: this.formatCurrency(summary.sales.bankDeposit),
        inline: true,
      },
      {
        name: "🪙 繰越準備金",
        value: this.formatCurrency(summary.sales.changeReserve),
        inline: true,
      },
    ];

    // メインのサマリーEmbed
    const mainEmbed: DiscordEmbed = {
      title: `📊 ${summary.date} 売上レポート`,
      color: 0x5865f2, // Discord Blue
      fields: salesFields,
      timestamp: new Date().toISOString(),
    };

    // 取引がない場合
    if (summary.products.length === 0) {
      const productEmbed: DiscordEmbed = {
        title: "🛒 商品別売上",
        description: "取引がありませんでした。",
        color: 0x57f287,
      };
      await this.send({
        embeds: [mainEmbed, productEmbed],
      });
      return;
    }

    // 商品リストを複数のEmbedに分割（Discordの4096文字制限対策）
    const productEmbeds = this.createProductEmbeds(summary.products);

    // 最初のメッセージ（メインEmbed + 最初の商品Embed）
    const firstBatch: DiscordEmbed[] = [mainEmbed];
    if (productEmbeds.length > 0) {
      firstBatch.push(productEmbeds[0]);
    }
    await this.send({ embeds: firstBatch });

    // 残りの商品Embedを送信（10個ずつ、Discordの制限）
    for (let i = 1; i < productEmbeds.length; i += 10) {
      const batch = productEmbeds.slice(i, i + 10);
      await this.send({ embeds: batch });
    }

    // 顧客リストがある場合は送信
    if (summary.customers.length > 0) {
      const customerEmbed = this.createCustomerEmbed(summary.customers);
      await this.send({ embeds: [customerEmbed] });
    }
  }

  /**
   * 商品リストを部門別にグルーピングして複数のEmbedに分割
   */
  private createProductEmbeds(products: ProductSummary[]): DiscordEmbed[] {
    // 部門別にグルーピング
    const categoryMap = new Map<string, { products: ProductSummary[]; totalAmount: number; totalQuantity: number }>();

    for (const p of products) {
      const categoryName = p.categoryName || "その他";
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { products: [], totalAmount: 0, totalQuantity: 0 });
      }
      const category = categoryMap.get(categoryName)!;
      category.products.push(p);
      category.totalAmount += p.totalAmount;
      category.totalQuantity += p.totalQuantity;
    }

    // 部門を合計金額順にソート
    const sortedCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1].totalAmount - a[1].totalAmount);

    const embeds: DiscordEmbed[] = [];
    let currentLines: string[] = [];
    let currentLength = 0;
    const MAX_LENGTH = 3900; // 4096より少し余裕を持たせる

    for (const [categoryName, categoryData] of sortedCategories) {
      // 部門内の商品を売上順にソート
      const sortedProducts = categoryData.products.sort((a, b) => b.totalAmount - a.totalAmount);

      // 部門ヘッダー
      const categoryHeader = `📦 **${categoryName}** - ${categoryData.totalQuantity}点 / ${this.formatCurrency(categoryData.totalAmount)}`;

      // 部門ヘッダーが入らない場合は新しいEmbedを作成
      if (currentLength + categoryHeader.length + 1 > MAX_LENGTH && currentLines.length > 0) {
        embeds.push({
          title: embeds.length === 0 ? "🛒 商品別売上" : "🛒 商品別売上（続き）",
          description: currentLines.join("\n"),
          color: 0x57f287,
        });
        currentLines = [];
        currentLength = 0;
      }

      currentLines.push(categoryHeader);
      currentLength += categoryHeader.length + 1;

      // 各商品
      for (const p of sortedProducts) {
        const productLine = `　・${p.productName} - ${p.totalQuantity}点 / ${this.formatCurrency(p.totalAmount)}`;

        // 文字数制限を超える場合は新しいEmbedを作成
        if (currentLength + productLine.length + 1 > MAX_LENGTH && currentLines.length > 0) {
          embeds.push({
            title: embeds.length === 0 ? "🛒 商品別売上" : "🛒 商品別売上（続き）",
            description: currentLines.join("\n"),
            color: 0x57f287,
          });
          currentLines = [];
          currentLength = 0;
        }

        currentLines.push(productLine);
        currentLength += productLine.length + 1;
      }

      // 部門間に空行を追加
      if (currentLength + 1 <= MAX_LENGTH) {
        currentLines.push("");
        currentLength += 1;
      }
    }

    // 残りを追加
    if (currentLines.length > 0) {
      embeds.push({
        title: embeds.length === 0 ? "🛒 商品別売上" : "🛒 商品別売上（続き）",
        description: currentLines.join("\n"),
        color: 0x57f287,
      });
    }

    return embeds;
  }

  /**
   * 顧客リストのEmbedを作成
   */
  private createCustomerEmbed(customers: CustomerSummary[]): DiscordEmbed {
    const lines: string[] = [];
    let zeroVisitCount = 0;
    let oneVisitCount = 0;
    let twoVisitCount = 0;
    let memberCount = 0;
    let unknownCount = 0;
    let employeeCount = 0;

    for (const c of customers) {
      // 従業員マーク
      const employeePrefix = c.isEmployee ? "🏠 " : "";

      // Unknownの場合は来店回数情報を表示しない
      if (!c.customerCode) {
        unknownCount++;
        const nameInfo = "**Unknown**";
        lines.push(`${nameInfo} - ${this.formatCurrency(c.totalAmount)}`);
        continue;
      }

      // 会員のカウント
      memberCount++;
      if (c.isEmployee) {
        employeeCount++;
      }

      const nameInfo = `**${c.customerName}** (${c.customerCode})`;

      // 来店回数に応じた絵文字マーク（会員のみ）
      let visitInfo: string;
      if (c.visitCount === 0) {
        visitInfo = `🆕 過去3ヶ月間0回 / `;
        zeroVisitCount++;
      } else if (c.visitCount === 1) {
        visitInfo = `🔰 過去3ヶ月間1回 / `;
        oneVisitCount++;
      } else if (c.visitCount === 2) {
        visitInfo = `2️⃣ 過去3ヶ月間2回 / `;
        twoVisitCount++;
      } else {
        visitInfo = `過去3ヶ月間${c.visitCount}回 / `;
      }

      lines.push(
        `${employeePrefix}${nameInfo} - ${visitInfo}${this.formatCurrency(c.totalAmount)}`
      );
    }

    // サマリーを追加
    const totalCustomerCount = memberCount + unknownCount;
    lines.push(""); // 空行
    lines.push("**📊 サマリー**");
    lines.push(`👥 総来店者数 - ${totalCustomerCount}人`);

    if (unknownCount > 0) {
      const unknownRatio = totalCustomerCount > 0
        ? Math.round((unknownCount / totalCustomerCount) * 100)
        : 0;
      lines.push(`❓ Unknown - ${unknownCount}人 (${unknownRatio}%)`);
    }

    const employeeRatio = totalCustomerCount > 0
      ? Math.round((employeeCount / totalCustomerCount) * 100)
      : 0;
    lines.push(`🏠 来店従業員数 - ${employeeCount}人 (${employeeRatio}%)`);

    if (oneVisitCount > 0) {
      const oneVisitRatio = totalCustomerCount > 0
        ? Math.round((oneVisitCount / totalCustomerCount) * 100)
        : 0;
      lines.push(`🔰 過去3ヶ月間来店1回人数 - ${oneVisitCount}人 (${oneVisitRatio}%)`);
    }
    if (twoVisitCount > 0) {
      const twoVisitRatio = totalCustomerCount > 0
        ? Math.round((twoVisitCount / totalCustomerCount) * 100)
        : 0;
      lines.push(`2️⃣ 過去3ヶ月間来店2回人数 - ${twoVisitCount}人 (${twoVisitRatio}%)`);
    }

    return {
      title: "👥 来店会員一覧",
      description: lines.join("\n") || "会員の来店がありませんでした。",
      color: 0xfee75c, // Discord Yellow
    };
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
}

/**
 * 環境変数からDiscordWebhookインスタンスを作成
 */
export function createDiscordWebhookFromEnv(): DiscordWebhook {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("Missing required environment variable: DISCORD_WEBHOOK_URL");
  }

  const botName = process.env.DISCORD_BOT_NAME || "スマレジ日報Bot";

  return new DiscordWebhook(webhookUrl, botName);
}
