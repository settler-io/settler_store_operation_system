/**
 * Discord Embed作成モジュール
 * GMOあおぞらネット銀行の入出金明細・残高をEmbed形式にフォーマット
 */

import { Transaction, Balance } from "./gmoaozora-client.js";

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
}

const COLOR_BLUE = 0x5865f2;
const COLOR_GREEN = 0x57f287;
const COLOR_RED = 0xed4245;
const COLOR_GOLD = 0xfee75c;

/**
 * 金額をフォーマット
 */
function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

/**
 * 入出金明細からDiscord Embedを作成
 */
export function createTransactionEmbeds(
  transactions: Transaction[],
  dateLabel: string,
): DiscordEmbed[] {
  if (transactions.length === 0) {
    return [{
      title: `🏦 ${dateLabel} 入出金明細`,
      description: "該当期間の入出金はありませんでした。",
      color: COLOR_BLUE,
      timestamp: new Date().toISOString(),
    }];
  }

  // 入金・出金を分離
  let totalDeposit = 0;
  let totalWithdrawal = 0;
  const lines: string[] = [];

  for (const tx of transactions) {
    const amount = Number(tx.amount) || 0;
    const isDeposit = tx.transactionType === "1";
    const sign = isDeposit ? "+" : "-";
    const emoji = isDeposit ? "🟢" : "🔴";

    if (isDeposit) {
      totalDeposit += amount;
    } else {
      totalWithdrawal += amount;
    }

    // 振込依頼人 or 摘要
    const who = tx.applicantName || tx.remarks || "不明";
    const bankInfo = tx.paymentBankName
      ? ` (${tx.paymentBankName}${tx.paymentBranchName ? ` ${tx.paymentBranchName}` : ""})`
      : "";

    lines.push(`${emoji} ${sign}${formatCurrency(amount)} - **${who}**${bankInfo}`);

    if (tx.ediInfo) {
      lines.push(`　　└ EDI: ${tx.ediInfo}`);
    }
  }

  const netAmount = totalDeposit - totalWithdrawal;
  const netEmoji = netAmount >= 0 ? "📈" : "📉";

  // サマリーEmbed
  const summaryEmbed: DiscordEmbed = {
    title: `🏦 ${dateLabel} 入出金明細`,
    color: COLOR_BLUE,
    fields: [
      { name: "取引件数", value: `${transactions.length}件`, inline: true },
      { name: "🟢 入金合計", value: formatCurrency(totalDeposit), inline: true },
      { name: "🔴 出金合計", value: formatCurrency(totalWithdrawal), inline: true },
      { name: `${netEmoji} 差引`, value: `${netAmount >= 0 ? "+" : ""}${formatCurrency(netAmount)}`, inline: true },
    ],
    timestamp: new Date().toISOString(),
  };

  // 明細リストEmbed（4096文字制限対策で分割）
  const embeds: DiscordEmbed[] = [summaryEmbed];
  const MAX_LENGTH = 3900;
  let currentLines: string[] = [];
  let currentLength = 0;

  for (const line of lines) {
    if (currentLength + line.length + 1 > MAX_LENGTH && currentLines.length > 0) {
      embeds.push({
        title: embeds.length === 1 ? "📋 明細一覧" : "📋 明細一覧（続き）",
        description: currentLines.join("\n"),
        color: COLOR_GOLD,
      });
      currentLines = [];
      currentLength = 0;
    }
    currentLines.push(line);
    currentLength += line.length + 1;
  }

  if (currentLines.length > 0) {
    embeds.push({
      title: embeds.length === 1 ? "📋 明細一覧" : "📋 明細一覧（続き）",
      description: currentLines.join("\n"),
      color: COLOR_GOLD,
    });
  }

  return embeds;
}

/**
 * 残高情報からDiscord Embedを作成
 */
export function createBalanceEmbed(balances: Balance[]): DiscordEmbed {
  if (balances.length === 0) {
    return {
      title: "💰 残高照会",
      description: "残高情報を取得できませんでした。",
      color: COLOR_RED,
    };
  }

  const fields = balances.map((b) => ({
    name: `${b.accountTypeName || b.accountTypeCode}`,
    value: [
      `残高: **${formatCurrency(b.balance)}**`,
      b.withdrawableAmount !== undefined ? `引出可能額: ${formatCurrency(b.withdrawableAmount)}` : "",
      b.previousDayBalance !== undefined ? `前日残高: ${formatCurrency(b.previousDayBalance)}` : "",
      `基準日時: ${b.baseDate} ${b.baseTime}`,
    ].filter(Boolean).join("\n"),
    inline: false,
  }));

  return {
    title: "💰 残高照会",
    color: COLOR_GREEN,
    fields,
    timestamp: new Date().toISOString(),
  };
}
