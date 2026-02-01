/**
 * スマレジAPIクライアント
 */
const API_BASE_URL = process.env.SMAREGI_USE_SANDBOX === "true"
    ? "https://api.smaregi.dev"
    : "https://api.smaregi.jp";
export class SmaregiClient {
    auth;
    constructor(auth) {
        this.auth = auth;
    }
    /**
     * 指定日の取引一覧を取得（詳細含む）
     */
    async getTransactions(date, storeId) {
        const accessToken = await this.auth.getAccessToken();
        const contractId = this.auth.getContractId();
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        const formatDate = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            const hours = String(d.getHours()).padStart(2, "0");
            const minutes = String(d.getMinutes()).padStart(2, "0");
            const seconds = String(d.getSeconds()).padStart(2, "0");
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
        };
        const allTransactions = [];
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
            const data = (await response.json());
            const transactions = Array.isArray(data) ? data : data.result || [];
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
    async getCustomers(customerIds) {
        const accessToken = await this.auth.getAccessToken();
        const contractId = this.auth.getContractId();
        const customerMap = new Map();
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
                    const customer = (await response.json());
                    customerMap.set(customerId, customer);
                }
            }
            catch (error) {
                console.error(`Failed to fetch customer ${customerId}:`, error);
            }
        }
        return customerMap;
    }
    /**
     * 取引から取引明細を抽出
     */
    extractTransactionDetails(transactions) {
        const details = [];
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
    extractCustomerIds(transactions) {
        const customerIdSet = new Set();
        for (const transaction of transactions) {
            if (transaction.customerId) {
                customerIdSet.add(transaction.customerId);
            }
        }
        return Array.from(customerIdSet);
    }
}
