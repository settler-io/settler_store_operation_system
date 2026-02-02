/**
 * Discordメッセージパーサー
 * メンション付きメッセージから日付と金額を解析
 */

export interface ParsedData {
  date: string; // YYYY-MM-DD形式
  amount: number;
}

/**
 * メッセージから日付と金額を解析
 *
 * サポートされるフォーマット:
 * - "2026-02-02 15600" → { date: "2026-02-02", amount: 15600 }
 * - "02-02 15600" → { date: "2026-02-02", amount: 15600 } (現在の年で補完)
 *
 * @param message メッセージ文字列
 * @returns 解析されたデータ、またはnull（解析失敗時）
 */
export function parseMessage(message: string): ParsedData | null {
  // メッセージをトリムして正規化
  const trimmed = message.trim();

  // パターン1: YYYY-MM-DD 金額
  const pattern1 = /^(\d{4})-(\d{2})-(\d{2})\s+(\d+)$/;
  const match1 = trimmed.match(pattern1);

  if (match1) {
    const year = match1[1];
    const month = match1[2];
    const day = match1[3];
    const amount = parseInt(match1[4], 10);

    return {
      date: `${year}-${month}-${day}`,
      amount,
    };
  }

  // パターン2: MM-DD 金額（年は現在の年で補完）
  const pattern2 = /^(\d{2})-(\d{2})\s+(\d+)$/;
  const match2 = trimmed.match(pattern2);

  if (match2) {
    const now = new Date();
    const jstOffset = 9 * 60;
    const nowJST = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60 * 1000);
    const year = nowJST.getFullYear();
    const month = match2[1];
    const day = match2[2];
    const amount = parseInt(match2[3], 10);

    return {
      date: `${year}-${month}-${day}`,
      amount,
    };
  }

  // 解析失敗
  return null;
}

/**
 * 日付文字列が有効かチェック
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}
