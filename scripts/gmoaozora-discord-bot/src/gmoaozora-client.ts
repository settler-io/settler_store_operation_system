/**
 * GMOあおぞらネット銀行 API クライアント
 * 法人口座向け入出金明細・残高照会
 */

const PRODUCTION_BASE_URL = "https://api.gmo-aozora.com/ganb/api/corporation/v1";
const SANDBOX_BASE_URL = "https://api.sunabar.gmo-aozora.com/corporation/v1";

/**
 * 入出金明細の1件
 */
export interface Transaction {
  transactionDate: string;       // 取引日 (YYYY-MM-DD)
  valueDate: string;             // 起算日
  transactionType: string;       // 入出金区分 (1: 入金, 2: 出金)
  transactionTypeName?: string;  // 入出金区分名
  amount: number;                // 取引金額
  remarks: string;               // 摘要
  applicantName?: string;        // 振込依頼人名
  paymentBankName?: string;      // 仕向銀行名
  paymentBranchName?: string;    // 仕向支店名
  ediInfo?: string;              // EDI情報
  balance?: number;              // 残高
}

/**
 * 入出金明細レスポンス
 */
interface TransactionsResponse {
  transactions: Transaction[];
  nextItemKey?: string;          // 次ページキー
  count?: number;
}

/**
 * 残高情報
 */
export interface Balance {
  accountId: string;
  accountTypeCode: string;
  accountTypeName: string;
  balance: number;
  withdrawableAmount?: number;
  previousDayBalance?: number;
  baseDate: string;
  baseTime: string;
  currencyCode: string;
  currencyName: string;
}

/**
 * 残高レスポンス
 */
interface BalancesResponse {
  balances: Balance[];
}

export class GmoAozoraClient {
  private accessToken: string;
  private baseUrl: string;

  constructor(accessToken: string, useSandbox: boolean = false) {
    this.accessToken = accessToken;
    this.baseUrl = useSandbox ? SANDBOX_BASE_URL : PRODUCTION_BASE_URL;
    console.log(`GMO Aozora API: ${useSandbox ? "SANDBOX" : "PRODUCTION"}`);
  }

  /**
   * 入出金明細を取得（ページネーション対応）
   */
  async getTransactions(accountId: string, dateFrom: string, dateTo: string): Promise<Transaction[]> {
    const allTransactions: Transaction[] = [];
    let nextItemKey: string | undefined;

    while (true) {
      const params = new URLSearchParams();
      params.set("accountId", accountId);
      params.set("dateFrom", dateFrom);
      params.set("dateTo", dateTo);
      if (nextItemKey) {
        params.set("nextItemKey", nextItemKey);
      }

      const url = `${this.baseUrl}/accounts/transactions?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "accept": "application/json;charset=UTF-8",
          "x-access-token": this.accessToken,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        // 404は明細なし
        if (response.status === 404) {
          break;
        }
        throw new Error(
          `GMO Aozora API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = (await response.json()) as TransactionsResponse;
      if (data.transactions && data.transactions.length > 0) {
        allTransactions.push(...data.transactions);
      }

      if (!data.nextItemKey) {
        break;
      }
      nextItemKey = data.nextItemKey;
    }

    return allTransactions;
  }

  /**
   * 前日の入出金明細を取得
   */
  async getYesterdayTransactions(accountId: string): Promise<Transaction[]> {
    const yesterday = this.getJSTDate(-1);
    return this.getTransactions(accountId, yesterday, yesterday);
  }

  /**
   * 残高照会
   */
  async getBalances(accountId: string): Promise<Balance[]> {
    const params = new URLSearchParams();
    params.set("accountId", accountId);

    const url = `${this.baseUrl}/accounts/balances?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "accept": "application/json;charset=UTF-8",
        "x-access-token": this.accessToken,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `GMO Aozora API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as BalancesResponse;
    return data.balances || [];
  }

  /**
   * JST日付を YYYY-MM-DD 形式で取得
   * @param offsetDays 日数オフセット（-1 = 昨日）
   */
  private getJSTDate(offsetDays: number = 0): string {
    const now = new Date();
    const jstOffset = 9 * 60;
    const jst = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60 * 1000);
    jst.setDate(jst.getDate() + offsetDays);

    const year = jst.getFullYear();
    const month = String(jst.getMonth() + 1).padStart(2, "0");
    const day = String(jst.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
