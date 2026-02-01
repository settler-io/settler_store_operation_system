/**
 * スマレジAPIクライアント
 */

import { SmaregiPlatformAuth } from "./smaregi-auth.js";

const API_BASE_URL =
  process.env.SMAREGI_USE_SANDBOX === "true"
    ? "https://api.smaregi.dev"
    : "https://api.smaregi.jp";

interface TransactionDetail {
  transactionDetailId: string;
  transactionId: string;
  transactionHeadId: string;
  transactionDateTime: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  salesPrice: number;
  categoryId: string;
  categoryName: string;
}

interface TransactionHead {
  transactionHeadId: string;
  transactionDateTime: string;
  transactionHeadDivision: string;
  cancelDivision: string;
  subtotal: number;
  total: number;
  storeId: string;
  customerId?: string;
  customerCode?: string;
  details?: TransactionDetail[];
}

interface Customer {
  customerId: string;
  customerCode: string;
  lastName?: string;
  firstName?: string;
  lastNameKana?: string;
  firstNameKana?: string;
}

export class SmaregiClient {
  private auth: SmaregiPlatformAuth;

  constructor(auth: SmaregiPlatformAuth) {
    this.auth = auth;
  }

  /**
   * 指定日の取引一覧を取得（詳細含む）
   */
  async getTransactions(date: Date, storeId?: string): Promise<TransactionHead[]> {
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

  /**
   * 顧客マスタを取得
   */
  async getCustomers(customerIds: string[]): Promise<Map<string, Customer>> {
    const accessToken = await this.auth.getAccessToken();
    const contractId = this.auth.getContractId();

    const customerMap = new Map<string, Customer>();

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
   * 取引から取引明細を抽出
   */
  extractTransactionDetails(transactions: TransactionHead[]): TransactionDetail[] {
    const details: TransactionDetail[] = [];

    for (const transaction of transactions) {
      if (transaction.details && transaction.details.length > 0) {
        for (const detail of transaction.details) {
          details.push({
            ...detail,
            transactionHeadId: transaction.transactionHeadId,
            transactionDateTime: transaction.transactionDateTime,
          });
        }
      }
    }

    return details;
  }

  /**
   * 取引からユニークな顧客IDリストを抽出
   */
  extractCustomerIds(transactions: TransactionHead[]): string[] {
    const customerIdSet = new Set<string>();

    for (const transaction of transactions) {
      if (transaction.customerId) {
        customerIdSet.add(transaction.customerId);
      }
    }

    return Array.from(customerIdSet);
  }
}
