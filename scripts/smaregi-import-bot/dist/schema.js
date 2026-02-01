/**
 * BigQueryテーブルスキーマ定義
 */
/**
 * 取引ヘッダーテーブルのスキーマ
 */
export const transactionsSchema = {
    fields: [
        { name: "transaction_head_id", type: "STRING", mode: "REQUIRED" },
        { name: "transaction_date_time", type: "TIMESTAMP", mode: "REQUIRED" },
        { name: "transaction_head_division", type: "STRING", mode: "NULLABLE" },
        { name: "cancel_division", type: "STRING", mode: "NULLABLE" },
        { name: "subtotal", type: "NUMERIC", mode: "NULLABLE" },
        { name: "total", type: "NUMERIC", mode: "REQUIRED" },
        { name: "store_id", type: "STRING", mode: "NULLABLE" },
        { name: "customer_id", type: "STRING", mode: "NULLABLE" },
        { name: "customer_code", type: "STRING", mode: "NULLABLE" },
        { name: "created_at", type: "TIMESTAMP", mode: "REQUIRED" },
    ],
};
/**
 * 取引明細テーブルのスキーマ
 */
export const transactionDetailsSchema = {
    fields: [
        { name: "transaction_detail_id", type: "STRING", mode: "REQUIRED" },
        { name: "transaction_head_id", type: "STRING", mode: "REQUIRED" },
        { name: "transaction_date_time", type: "TIMESTAMP", mode: "REQUIRED" },
        { name: "product_id", type: "STRING", mode: "NULLABLE" },
        { name: "product_code", type: "STRING", mode: "NULLABLE" },
        { name: "product_name", type: "STRING", mode: "NULLABLE" },
        { name: "quantity", type: "NUMERIC", mode: "NULLABLE" },
        { name: "price", type: "NUMERIC", mode: "NULLABLE" },
        { name: "sales_price", type: "NUMERIC", mode: "NULLABLE" },
        { name: "category_id", type: "STRING", mode: "NULLABLE" },
        { name: "category_name", type: "STRING", mode: "NULLABLE" },
        { name: "created_at", type: "TIMESTAMP", mode: "REQUIRED" },
    ],
};
/**
 * 顧客マスタテーブルのスキーマ
 */
export const customersSchema = {
    fields: [
        { name: "customer_id", type: "STRING", mode: "REQUIRED" },
        { name: "customer_code", type: "STRING", mode: "REQUIRED" },
        { name: "last_name", type: "STRING", mode: "NULLABLE" },
        { name: "first_name", type: "STRING", mode: "NULLABLE" },
        { name: "last_name_kana", type: "STRING", mode: "NULLABLE" },
        { name: "first_name_kana", type: "STRING", mode: "NULLABLE" },
        { name: "updated_at", type: "TIMESTAMP", mode: "REQUIRED" },
    ],
};
