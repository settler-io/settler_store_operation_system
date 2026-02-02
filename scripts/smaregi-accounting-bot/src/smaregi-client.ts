/**
 * スマレジAPIクライアント（現金売上取得用）
 */

import { SmaregiPlatformAuth } from "./smaregi-auth.js";

const API_BASE_URL =
  process.env.SMAREGI_USE_SANDBOX === "true"
    ? "https://api.smaregi.dev"
    : "https://api.smaregi.jp";

interface TransactionHead {
  transactionHeadId: string;
  transactionDateTime: string;
  transactionHeadDivision: string;
  cancelDivision: string;
  subtotal: number;
  total: number;
  cashTotal: number | string; // 現金売上合計
  creditTotal: number | string; // クレジット売上合計
  depositCash: number | string; // 現金入金額
  depositCredit: number | string; // クレジット入金額
  storeId: string;
}

export interface CashSalesData {
  date: string; // 発生日 (YYYY-MM-DD)
  amount: number; // 現金売上金額
  recordedAt: string; // 記録日時 (ISO8601 JST)
}

export class SmaregiClient {
  private auth: SmaregiPlatformAuth;

  constructor(auth: SmaregiPlatformAuth) {
    this.auth = auth;
  }

  /**
   * 指定日の現金売上を取得
   */
  async getCashSales(date: Date, storeId?: string): Promise<CashSalesData> {
    const transactions = await this.getTransactions(date, storeId);

    console.log(`取得した取引数: ${transactions.length}`);

    // 現金での支払いのみを抽出して合計
    let totalCashSales = 0;
    let cashTransactionCount = 0;

    for (const transaction of transactions) {
      // キャンセル取引は除外
      if (transaction.cancelDivision === "1") {
        continue;
      }

      // cashTotalまたはdepositCashを使用して現金売上を集計
      // APIから返される値は文字列の可能性があるので数値に変換
      const cashAmount = parseFloat(String(transaction.cashTotal || transaction.depositCash || "0"));

      if (cashAmount > 0) {
        totalCashSales += cashAmount;
        cashTransactionCount++;
        console.log(`取引ID: ${transaction.transactionHeadId}, 現金: ¥${cashAmount}`);
      }
    }

    console.log(`現金取引数: ${cashTransactionCount}, 合計金額: ¥${totalCashSales}`);

    // JSTで現在時刻を取得
    const now = new Date();
    const jstOffset = 9 * 60;
    const nowJST = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60 * 1000);

    // 発生日をYYYY-MM-DD形式にフォーマット
    const dateStr = date.toISOString().split("T")[0];

    return {
      date: dateStr,
      amount: totalCashSales,
      recordedAt: nowJST.toISOString(),
    };
  }

  /**
   * 指定日の取引一覧を取得（支払い情報含む）
   */
  private async getTransactions(date: Date, storeId?: string): Promise<TransactionHead[]> {
    const accessToken = await this.auth.getAccessToken();
    const contractId = this.auth.getContractId();

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const formatDate = (d: Date): string => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const seconds = String(d.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
    };

    const allTransactions: TransactionHead[] = [];
    let page = 1;
    const limit = 100;

    while (true) {
      const params = new URLSearchParams();
      params.set("transaction_date_time-from", formatDate(startDate));
      params.set("transaction_date_time-to", formatDate(endDate));
      params.set("limit", limit.toString());
      params.set("page", page.toString());

      if (storeId) {
        params.set("store_id", storeId);
      }

      const url = `${API_BASE_URL}/${contractId}/pos/transactions?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as TransactionHead[] | { result?: TransactionHead[] };
      const transactions: TransactionHead[] = Array.isArray(data) ? data : data.result || [];

      if (transactions.length === 0) {
        break;
      }

      allTransactions.push(...transactions);

      if (transactions.length < limit) {
        break;
      }

      page++;
    }

    return allTransactions;
  }
}
