/**
 * スマレジ取引履歴取得・集計モジュール
 */

import { SmaregiPlatformAuth } from "./smaregi-auth.js";

// 環境変数でAPI URLを切り替え（開発環境: api.smaregi.dev, 本番: api.smaregi.jp）
const API_BASE_URL =
  process.env.SMAREGI_USE_SANDBOX === "true"
    ? "https://api.smaregi.dev"
    : "https://api.smaregi.jp";

/**
 * 取引明細（商品単位）
 */
interface TransactionDetail {
  transactionDetailId: string;
  transactionId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  salesPrice: number;
  unitDiscountPrice: number;
  unitDiscountRate: number;
  unitDiscountDivision: string;
  taxRate: number;
  categoryId: string;
  categoryName: string;
}

/**
 * 取引ヘッダー
 */
interface TransactionHead {
  transactionHeadId: string;
  transactionDateTime: string;
  transactionHeadDivision: string;  // "1": 売上, "2": 返品, "7": 精算
  cancelDivision: string;
  subtotal: number;
  total: number;
  storeId: string;
  customerId?: string;
  customerCode?: string;
  details?: TransactionDetail[];
  // 支払い情報（取引ヘッダーに直接含まれる）
  depositCash?: string;       // 現金預り金
  depositCredit?: string;     // クレジット預り金
  cashTotal?: string;         // 現金売上
  creditTotal?: string;       // クレジット売上
  cardCompany?: string;       // カード会社（PAYGATE経由の場合に設定）
  creditDivision?: string;    // クレジット区分
  // 精算情報
  disposeDivision?: string;   // 精算区分 "1": 銀行預入, "2": 繰越準備金
  disposeAmount?: number;     // 精算金額
}

/**
 * API レスポンス
 */
interface TransactionsResponse {
  result: TransactionHead[];
  totalCount: number;
  limit: number;
  page: number;
}

/**
 * 商品別集計結果
 */
export interface ProductSummary {
  productId: string;
  productCode: string;
  productName: string;
  categoryName: string;
  totalQuantity: number;
  totalAmount: number;
  transactionCount: number;
}

/**
 * 顧客マスタ情報
 */
interface Customer {
  customerId: string;
  customerCode: string;
  lastName?: string;
  firstName?: string;
  lastNameKana?: string;
  firstNameKana?: string;
  visitCount?: number;
}

/**
 * PlayerName API レスポンス
 */
interface PlayerData {
  id: string;
  playername: string;
  isEmployee: boolean;
}

interface PlayerNameApiResponse {
  status: string;
  count: number;
  players: PlayerData[];
}

/**
 * 顧客別集計結果
 */
export interface CustomerSummary {
  customerId: string;
  customerCode: string;
  customerName: string;
  visitCount: number;
  transactionCount: number;
  totalAmount: number;
  isEmployee: boolean;
}

/**
 * 売上サマリー
 */
export interface SalesSummary {
  netSales: number;        // 純売上（売上 - 返品）
  cashSales: number;       // 現金売上
  creditSales: number;     // クレジット売上
  paygateSales: number;    // PAYGATE売上
  otherSales: number;      // その他売上（電子マネー等）
  bankDeposit: number;     // 銀行預入金
  changeReserve: number;   // 繰越準備金
}

/**
 * 日次サマリー
 */
export interface DailySummary {
  date: string;
  products: ProductSummary[];
  customers: CustomerSummary[];
  totalTransactions: number;
  totalAmount: number;
  totalQuantity: number;
  sales: SalesSummary;
}

export class SmaregiTransactions {
  private auth: SmaregiPlatformAuth;

  constructor(auth: SmaregiPlatformAuth) {
    this.auth = auth;
  }

  /**
   * 指定日の取引一覧を取得
   * @param date 取得する日付
   * @param storeId 店舗ID（指定しない場合は全店舗）
   */
  async getTransactions(date: Date, storeId?: string): Promise<TransactionHead[]> {
    const accessToken = await this.auth.getAccessToken();
    const contractId = this.auth.getContractId();

    // 日付の範囲を設定（その日の00:00:00から23:59:59まで）
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

    // ページネーションで全件取得
    while (true) {
      const params = new URLSearchParams();
      // プラットフォームAPIはハイフン区切りのパラメータ名を使用
      params.set("transaction_date_time-from", formatDate(startDate));
      params.set("transaction_date_time-to", formatDate(endDate));
      params.set("with_details", "all");
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
        const errorText = await response.text();
        throw new Error(
          `Failed to get transactions: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = (await response.json()) as TransactionHead[] | { result?: TransactionHead[]; total_count?: number; totalCount?: number };
      console.log("API Response:", JSON.stringify(data, null, 2).slice(0, 500));

      // プラットフォームAPIのレスポンス形式に対応（配列またはオブジェクト）
      const transactions: TransactionHead[] = Array.isArray(data) ? data : (data.result || []);

      if (transactions.length === 0) {
        break;
      }

      allTransactions.push(...transactions);

      // 100件未満なら最後のページ
      if (transactions.length < limit) {
        break;
      }

      page++;
    }

    // ポイント加算（transactionHeadDivision="6"）を除外
    return allTransactions.filter(t => t.transactionHeadDivision !== "6");
  }

  /**
   * 前日の取引を取得
   */
  async getYesterdayTransactions(): Promise<TransactionHead[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.getTransactions(yesterday);
  }

  /**
   * 取引を商品別に集計
   */
  aggregateByProduct(transactions: TransactionHead[]): ProductSummary[] {
    const productMap = new Map<string, ProductSummary>();

    for (const transaction of transactions) {
      if (!transaction.details) continue;

      for (const detail of transaction.details) {
        const key = detail.productId;

        if (!productMap.has(key)) {
          productMap.set(key, {
            productId: detail.productId,
            productCode: detail.productCode,
            productName: detail.productName,
            categoryName: detail.categoryName || "未分類",
            totalQuantity: 0,
            totalAmount: 0,
            transactionCount: 0,
          });
        }

        const summary = productMap.get(key)!;
        const qty = Number(detail.quantity) || 0;
        const price = Number(detail.salesPrice) || 0;
        summary.totalQuantity += qty;
        summary.totalAmount += price * qty;
        summary.transactionCount += 1;
      }
    }

    // 金額の高い順にソート
    return Array.from(productMap.values()).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );
  }

  /**
   * 顧客マスタ情報を取得
   */
  async getCustomers(customerIds: string[]): Promise<Map<string, Customer>> {
    if (customerIds.length === 0) {
      return new Map();
    }

    const accessToken = await this.auth.getAccessToken();
    const contractId = this.auth.getContractId();

    const customerMap = new Map<string, Customer>();

    // 顧客IDをカンマ区切りで送信（APIによっては複数IDをサポート）
    // サポートされていない場合は個別に取得
    for (const customerId of customerIds) {
      try {
        const url = `${API_BASE_URL}/${contractId}/pos/customers/${customerId}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const customer = (await response.json()) as Customer;
          customerMap.set(customerId, customer);
        }
      } catch (error) {
        console.error(`Failed to fetch customer ${customerId}:`, error);
      }
    }

    return customerMap;
  }

  /**
   * PlayerName APIから全プレイヤー情報を取得（名前と従業員フラグ）
   */
  async getPlayerNames(): Promise<Map<string, { playername: string; isEmployee: boolean }>> {
    const playerNameMap = new Map<string, { playername: string; isEmployee: boolean }>();

    try {
      const url = "https://script.google.com/macros/s/AKfycbydlwyhtNpKK7kEJoFuAWUEQcf1Ja_4pFaXmRnDBthgY5m5urVbyXa9OPGNaA2bGHY_/exec";

      const response = await fetch(url);

      if (response.ok) {
        const data = (await response.json()) as PlayerNameApiResponse;

        if (data.status === "success" && data.players) {
          for (const player of data.players) {
            if (player.id && player.playername) {
              // idをキーとしてplayernameとisEmployeeをマッピング
              playerNameMap.set(player.id, {
                playername: player.playername,
                isEmployee: player.isEmployee || false,
              });
            }
          }
          console.log(`  - PlayerName API: ${playerNameMap.size}件のプレイヤー情報を取得`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch player names from API:", error);
      // エラーが発生しても処理を続行（スマレジの顧客名を使用）
    }

    return playerNameMap;
  }

  /**
   * 顧客の過去3ヶ月の来店回数を取得（顧客コードを使用）
   */
  async getCustomerTotalVisitCount(customerCode: string): Promise<number> {
    const accessToken = await this.auth.getAccessToken();
    const contractId = this.auth.getContractId();

    const uniqueDates = new Set<string>();

    // JST時刻を正確に計算
    const now = new Date();
    const jstOffset = 9 * 60; // JST is UTC+9
    const nowJST = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60 * 1000);

    // 今日の日付（JST）を取得し、00:00:00に設定
    const today = new Date(nowJST);
    today.setHours(0, 0, 0, 0);

    const formatDate = (d: Date): string => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const seconds = String(d.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
    };

    // 過去3ヶ月を30日ずつ3回に分けて取得（APIの31日制限に対応）
    const periods = [
      { daysAgo: 0 },   // 直近30日
      { daysAgo: 30 },  // 30-60日前
      { daysAgo: 60 },  // 60-90日前
    ];

    for (const period of periods) {
      // 期間の終了日（その日の23:59:59）
      const toDate = new Date(today);
      toDate.setDate(toDate.getDate() - period.daysAgo);
      toDate.setHours(23, 59, 59, 999);

      // 期間の開始日（30日前の00:00:00）
      const fromDate = new Date(today);
      fromDate.setDate(fromDate.getDate() - period.daysAgo - 30);
      fromDate.setHours(0, 0, 0, 0);

      let page = 1;
      const limit = 100;

      while (true) {
        const params = new URLSearchParams();
        params.set("customer_code", customerCode);
        params.set("transaction_date_time-from", formatDate(fromDate));
        params.set("transaction_date_time-to", formatDate(toDate));
        params.set("limit", limit.toString());
        params.set("page", page.toString());

        const url = `${API_BASE_URL}/${contractId}/pos/transactions?${params.toString()}`;

        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            break;
          }

          const data = (await response.json()) as TransactionHead[] | { result?: TransactionHead[] };
          const transactions: TransactionHead[] = Array.isArray(data) ? data : (data.result || []);

          if (transactions.length === 0) {
            break;
          }

          // 取引日をユニークな日付として集計
          for (const transaction of transactions) {
            const date = transaction.transactionDateTime.split("T")[0];
            uniqueDates.add(date);
          }

          // 100件未満なら最後のページ
          if (transactions.length < limit) {
            break;
          }

          page++;
        } catch (error) {
          console.error(`Error fetching visit count for customer ${customerCode}:`, error);
          break;
        }
      }
    }

    return uniqueDates.size;
  }

  /**
   * 取引を顧客別に集計（重複許容、週次レポート用）
   * 同じ顧客が複数回来店した場合、それぞれを別カウント（延べ来店数）
   */
  async aggregateByCustomerWithDuplicates(transactions: TransactionHead[]): Promise<CustomerSummary[]> {
    // ユニークな顧客IDを抽出（過去3ヶ月来店回数取得のため）
    const uniqueCustomerIds = new Set<string>();
    const customerCodeMap = new Map<string, string>();

    for (const transaction of transactions) {
      if (transaction.customerId && transaction.customerCode) {
        uniqueCustomerIds.add(transaction.customerId);
        customerCodeMap.set(transaction.customerId, transaction.customerCode);
      }
    }

    // 過去3ヶ月の来店回数を取得（ユニーク顧客のみ）
    console.log(`  - 顧客${uniqueCustomerIds.size}名の過去3ヶ月来店回数を計算中...`);
    const visitCountMap = new Map<string, number>();
    const batchSize = 5;

    const uniqueIds = Array.from(uniqueCustomerIds);
    for (let i = 0; i < uniqueIds.length; i += batchSize) {
      const batch = uniqueIds.slice(i, i + batchSize);
      const batchPromises = batch.map(async (id) => {
        const customerCode = customerCodeMap.get(id) || "";
        const visitCount = await this.getCustomerTotalVisitCount(customerCode);
        return { id, visitCount };
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ id, visitCount }) => {
        visitCountMap.set(id, visitCount);
      });

      console.log(`    - 進捗: ${Math.min(i + batchSize, uniqueIds.length)}/${uniqueIds.length}件完了`);
    }

    // 各取引を個別にカウント（重複許容）
    const results: CustomerSummary[] = [];
    for (const transaction of transactions) {
      if (!transaction.customerId) {
        // Unknown顧客の場合
        results.push({
          customerId: `UNKNOWN_${transaction.transactionHeadId}`,
          customerCode: "",
          customerName: "Unknown",
          visitCount: 0,
          transactionCount: 1,
          totalAmount: Number(transaction.total) || 0,
          isEmployee: false,
        });
      } else {
        // 通常の顧客の場合（各取引を個別カウント）
        const visitCount = visitCountMap.get(transaction.customerId) || 0;
        results.push({
          customerId: transaction.customerId,
          customerCode: transaction.customerCode || "",
          customerName: transaction.customerCode || "Unknown",
          visitCount,
          transactionCount: 1,
          totalAmount: Number(transaction.total) || 0,
          isEmployee: false,
        });
      }
    }

    return results;
  }

  /**
   * 取引を顧客別に集計（顧客マスタ情報を含む）
   */
  async aggregateByCustomer(transactions: TransactionHead[]): Promise<CustomerSummary[]> {
    const tempMap = new Map<string, { transactionCount: number; totalAmount: number; customerCode: string }>();

    // まず取引から集計
    for (const transaction of transactions) {
      // 顧客IDがない場合は取引IDをキーとして個別に扱う
      const key = transaction.customerId || `UNKNOWN_${transaction.transactionHeadId}`;

      if (!tempMap.has(key)) {
        tempMap.set(key, {
          transactionCount: 0,
          totalAmount: 0,
          customerCode: transaction.customerCode || "",
        });
      }

      const summary = tempMap.get(key)!;
      summary.transactionCount += 1;
      summary.totalAmount += Number(transaction.total) || 0;
    }

    // 顧客マスタから情報を取得（UNKNOWNを除く）
    const customerIds = Array.from(tempMap.keys()).filter(id => !id.startsWith("UNKNOWN_"));
    const customerMaster = await this.getCustomers(customerIds);

    // PlayerName APIからプレイヤー名を取得
    const playerNameMap = await this.getPlayerNames();

    // 過去3ヶ月の来店回数を取得（バッチ処理、顧客コードを使用）
    console.log(`  - 顧客${customerIds.length}名の過去3ヶ月来店回数を計算中...`);
    const visitCountMap = new Map<string, number>();
    const batchSize = 5; // 5件ずつ処理してAPIレート制限を回避

    for (let i = 0; i < customerIds.length; i += batchSize) {
      const batch = customerIds.slice(i, i + batchSize);
      const batchPromises = batch.map(async (id) => {
        const customerCode = tempMap.get(id)?.customerCode || "";
        const visitCount = await this.getCustomerTotalVisitCount(customerCode);
        return { id, visitCount };
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ id, visitCount }) => {
        visitCountMap.set(id, visitCount);
      });

      console.log(`    - 進捗: ${Math.min(i + batchSize, customerIds.length)}/${customerIds.length}件完了`);
    }

    // 最終的なサマリーを作成
    const results: CustomerSummary[] = [];
    for (const [customerId, temp] of tempMap.entries()) {
      if (customerId.startsWith("UNKNOWN_")) {
        // Unknown顧客の場合（取引ごとに個別）
        results.push({
          customerId: customerId,
          customerCode: "",
          customerName: "Unknown",
          visitCount: 0,
          transactionCount: temp.transactionCount,
          totalAmount: temp.totalAmount,
          isEmployee: false,
        });
      } else {
        // 通常の顧客の場合
        const customer = customerMaster.get(customerId);
        const lastName = customer?.lastName || "";
        const firstName = customer?.firstName || "";
        const visitCount = visitCountMap.get(customerId) || 0;

        // PlayerName APIから情報を取得
        const playerInfo = playerNameMap.get(temp.customerCode);
        const isEmployee = playerInfo?.isEmployee || false;

        // 顧客名の優先順位: 1. PlayerName API, 2. スマレジ顧客名, 3. 顧客コード
        let customerName: string;
        if (playerInfo && playerInfo.playername && playerInfo.playername.trim()) {
          // PlayerName APIにplayernameが存在する場合
          customerName = playerInfo.playername;
        } else if (lastName && firstName) {
          // スマレジの顧客名が存在する場合
          customerName = `${lastName} ${firstName}`;
        } else {
          // どちらもない場合は顧客コードを使用
          customerName = temp.customerCode;
        }

        results.push({
          customerId,
          customerCode: temp.customerCode,
          customerName,
          visitCount, // 過去3ヶ月間の来店回数
          transactionCount: temp.transactionCount, // 昨日の取引回数
          totalAmount: temp.totalAmount,
          isEmployee,
        });
      }
    }

    // 昨日の取引回数の多い順にソート
    return results.sort((a, b) => b.transactionCount - a.transactionCount);
  }

  /**
   * 売上情報を集計
   */
  aggregateSales(transactions: TransactionHead[]): SalesSummary {
    let grossSales = 0;      // 総売上
    let returns = 0;         // 返品
    let cashSales = 0;       // 現金売上
    let creditSales = 0;     // クレジット売上（スマレジ独自）
    let paygateSales = 0;    // PAYGATE売上
    let otherSales = 0;      // その他売上
    let bankDeposit = 0;     // 銀行預入金
    let changeReserve = 0;   // 繰越準備金

    for (const transaction of transactions) {
      const total = Number(transaction.total) || 0;

      // 取引区分による分類
      // "1": 売上, "2": 返品, "7": 精算
      if (transaction.transactionHeadDivision === "1") {
        grossSales += total;

        // 支払い方法別に集計
        const depositCash = Number(transaction.depositCash) || 0;
        const depositCredit = Number(transaction.depositCredit) || 0;

        // 現金売上
        cashSales += depositCash;

        // クレジット/PAYGATE判定
        // cardCompanyがある場合はPAYGATE経由
        if (depositCredit > 0) {
          if (transaction.cardCompany) {
            paygateSales += depositCredit;
          } else {
            creditSales += depositCredit;
          }
        }
      } else if (transaction.transactionHeadDivision === "2") {
        returns += total;
      } else if (transaction.transactionHeadDivision === "7") {
        // 精算取引
        const disposeAmount = Number(transaction.disposeAmount) || Number(transaction.total) || 0;
        // disposeDivision: "1": 銀行預入, "2": 繰越準備金
        if (transaction.disposeDivision === "1") {
          bankDeposit += disposeAmount;
        } else if (transaction.disposeDivision === "2") {
          changeReserve += disposeAmount;
        }
      }
    }

    return {
      netSales: grossSales - returns,
      cashSales,
      creditSales,
      paygateSales,
      otherSales,
      bankDeposit,
      changeReserve,
    };
  }

  /**
   * 日次サマリーを作成
   */
  async createDailySummary(date: Date, transactions: TransactionHead[]): Promise<DailySummary> {
    const products = this.aggregateByProduct(transactions);
    const customers = await this.aggregateByCustomer(transactions);
    const sales = this.aggregateSales(transactions);

    const totalAmount = products.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalQuantity = products.reduce((sum, p) => sum + p.totalQuantity, 0);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return {
      date: `${year}/${month}/${day}`,
      products,
      customers,
      totalTransactions: transactions.length,
      totalAmount,
      totalQuantity,
      sales,
    };
  }

  /**
   * 前日の日次サマリーを取得（日本時間基準）
   * @param storeId 店舗ID（指定しない場合は全店舗）
   */
  async getYesterdaySummary(storeId?: string): Promise<DailySummary> {
    // 日本時間（JST, UTC+9）で現在時刻を取得
    const now = new Date();
    const jstOffset = 9 * 60; // 日本時間は UTC+9時間
    const nowJST = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60 * 1000);

    // 日本時間で前日を計算
    const yesterday = new Date(nowJST);
    yesterday.setDate(yesterday.getDate() - 1);

    const transactions = await this.getTransactions(yesterday, storeId);
    return await this.createDailySummary(yesterday, transactions);
  }

  /**
   * 前週の週次サマリーを取得（月曜日〜日曜日、日本時間基準）
   * 週次サマリーでは商品別・顧客別の詳細は不要なため、売上情報のみを集計
   * @param storeId 店舗ID（指定しない場合は全店舗）
   */
  async getLastWeekSummary(storeId?: string): Promise<DailySummary> {
    // 日本時間（JST, UTC+9）で現在時刻を取得
    const now = new Date();
    const jstOffset = 9 * 60;
    const nowJST = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60 * 1000);

    // 今日の曜日を取得（0: 日曜日, 1: 月曜日, ..., 6: 土曜日）
    const today = new Date(nowJST);
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();

    // 前週の月曜日を計算
    // 今日が月曜日(1)の場合: 7日前が前週の月曜日
    // 今日が火曜日(2)の場合: 8日前が前週の月曜日
    // 今日が日曜日(0)の場合: 6日前が前週の月曜日
    const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek + 6;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysToLastMonday);

    // 前週の日曜日（月曜日の6日後）
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);

    // 前週の各日の取引を取得
    const allTransactions: TransactionHead[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(lastMonday);
      date.setDate(lastMonday.getDate() + i);
      const transactions = await this.getTransactions(date, storeId);
      allTransactions.push(...transactions);
    }

    // 前週の期間をラベルとして使用
    const formatDateLabel = (d: Date): string => {
      const month = d.getMonth() + 1;
      const day = d.getDate();
      return `${month}/${day}`;
    };

    const dateLabel = `${formatDateLabel(lastMonday)}〜${formatDateLabel(lastSunday)}（前週）`;

    // 集計（週次サマリーでは顧客サマリー統計のみ必要、重複を許容）
    const products = this.aggregateByProduct(allTransactions);
    const customers = await this.aggregateByCustomerWithDuplicates(allTransactions);
    const sales = this.aggregateSales(allTransactions);

    const totalAmount = products.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalQuantity = products.reduce((sum, p) => sum + p.totalQuantity, 0);

    return {
      date: dateLabel,
      products,
      customers, // 週次サマリーでは顧客サマリー統計のみ表示
      totalTransactions: allTransactions.length,
      totalAmount,
      totalQuantity,
      sales,
    };
  }
}
