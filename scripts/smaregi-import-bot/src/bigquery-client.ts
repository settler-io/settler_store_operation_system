/**
 * BigQueryクライアント
 */

import { BigQuery, Table } from "@google-cloud/bigquery";
import { transactionsSchema, transactionDetailsSchema, customersSchema } from "./schema.js";
import * as fs from "fs";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export class BigQueryClient {
  private bigquery: BigQuery;
  private projectId: string;
  private datasetId: string;

  constructor(projectId: string, datasetId: string, keyFilename?: string) {
    this.projectId = projectId;
    this.datasetId = datasetId;

    this.bigquery = new BigQuery({
      projectId,
      keyFilename,
    });
  }

  /**
   * データセットが存在するか確認、なければ作成
   */
  async ensureDataset(): Promise<void> {
    const dataset = this.bigquery.dataset(this.datasetId);
    const [exists] = await dataset.exists();

    if (!exists) {
      console.log(`Creating dataset: ${this.datasetId}`);
      await dataset.create({
        location: "asia-northeast1", // 東京リージョン
      });
      console.log(`Dataset ${this.datasetId} created.`);
    } else {
      console.log(`Dataset ${this.datasetId} already exists.`);
    }
  }

  /**
   * テーブルが存在するか確認、なければ作成
   */
  async ensureTable(tableId: string, schema: any): Promise<Table> {
    const table = this.bigquery.dataset(this.datasetId).table(tableId);
    const [exists] = await table.exists();

    if (!exists) {
      console.log(`Creating table: ${tableId}`);
      const [createdTable] = await table.create({
        schema: schema,
        // パーティションなし - すべてのデータを保持
      });
      console.log(`Table ${tableId} created without partitioning.`);
      return createdTable;
    } else {
      console.log(`Table ${tableId} already exists.`);
      return table;
    }
  }

  /**
   * 全テーブルを作成
   */
  async ensureAllTables(): Promise<void> {
    await this.ensureDataset();
    await this.ensureTable("transactions", transactionsSchema);
    await this.ensureTable("transaction_details", transactionDetailsSchema);
    await this.ensureTable("customers", customersSchema);
  }

  /**
   * 取引ヘッダーデータを挿入（Load Job方式）
   * @param transactions - 挿入する取引データ
   */
  async insertTransactions(transactions: any[]): Promise<void> {
    if (transactions.length === 0) return;

    const rows = transactions.map((t) => ({
      transaction_head_id: t.transactionHeadId,
      transaction_date_time: t.transactionDateTime,
      transaction_head_division: t.transactionHeadDivision || null,
      cancel_division: t.cancelDivision || null,
      subtotal: Number(t.subtotal) || 0,
      total: Number(t.total) || 0,
      store_id: t.storeId || null,
      customer_id: t.customerId || null,
      customer_code: t.customerCode || null,
      created_at: new Date().toISOString(),
    }));

    const tempFile = `/tmp/bq_transactions_${Date.now()}.jsonl`;

    try {
      // JSONL形式で一時ファイルに書き出し
      const jsonlData = rows.map((r) => JSON.stringify(r)).join("\n");
      await writeFile(tempFile, jsonlData);

      // デバッグ: 一時ファイルのサイズと最初の行を表示
      console.log(`  - Temp file: ${tempFile} (${jsonlData.length} bytes)`);
      console.log(`  - First row sample: ${JSON.stringify(rows[0]).substring(0, 100)}...`);

      // Load Job実行
      const table = this.bigquery.dataset(this.datasetId).table("transactions");
      const loadOptions: any = {
        sourceFormat: "NEWLINE_DELIMITED_JSON",
        writeDisposition: "WRITE_APPEND",
        autodetect: false,
        schema: transactionsSchema,
      };

      const [job] = await table.load(tempFile, loadOptions);

      console.log(`  - Load Job started (Job: ${job.id})`);

      // CRITICAL: Load Jobが完了するまで待機してから一時ファイルを削除
      // BigQueryがファイルを読み込む前にファイルが削除されないようにする
      // シンプルな解決策：一定時間待機
      await new Promise((resolve) => setTimeout(resolve, 20000)); // 20秒待機

      console.log(`  - Inserted ${rows.length} transactions`);

      // デバッグ: 一時ファイルを削除せずに残す
      console.log(`  - Temp file kept at: ${tempFile}`);
      // try {
      //   await unlink(tempFile);
      //   console.log(`  - Temp file deleted`);
      // } catch (e) {
      //   // ファイル削除失敗は無視
      // }
    } catch (error: any) {
      console.error("  - Insert error:", error.message);
      throw error;
    }
  }

  /**
   * 取引明細データを挿入（Load Job方式）
   * @param details - 挿入する取引明細データ
   */
  async insertTransactionDetails(details: any[]): Promise<void> {
    if (details.length === 0) return;

    const rows = details.map((d) => ({
      transaction_detail_id: d.transactionDetailId,
      transaction_head_id: d.transactionHeadId,
      transaction_date_time: d.transactionDateTime,
      product_id: d.productId || null,
      product_code: d.productCode || null,
      product_name: d.productName || null,
      quantity: Number(d.quantity) || null,
      price: Number(d.price) || null,
      sales_price: Number(d.salesPrice) || null,
      category_id: d.categoryId || null,
      category_name: d.categoryName || null,
      created_at: new Date().toISOString(),
    }));

    const tempFile = `/tmp/bq_transaction_details_${Date.now()}.jsonl`;

    try {
      // JSONL形式で一時ファイルに書き出し
      const jsonlData = rows.map((r) => JSON.stringify(r)).join("\n");
      await writeFile(tempFile, jsonlData);

      // Load Job実行
      const table = this.bigquery.dataset(this.datasetId).table("transaction_details");
      const loadOptions: any = {
        sourceFormat: "NEWLINE_DELIMITED_JSON",
        writeDisposition: "WRITE_APPEND",
        autodetect: false,
        schema: transactionDetailsSchema,
      };

      const [job] = await table.load(tempFile, loadOptions);

      console.log(`  - Inserted ${rows.length} transaction details (Job: ${job.id})`);
    } catch (error: any) {
      console.error("  - Insert error:", error.message);
      throw error;
    } finally {
      // 一時ファイル削除
      try {
        await unlink(tempFile);
      } catch (e) {
        // ファイル削除失敗は無視
      }
    }
  }

  /**
   * 顧客マスタデータを挿入（Load Job方式）
   */
  async upsertCustomers(customers: any[]): Promise<void> {
    if (customers.length === 0) return;

    const rows = customers.map((c) => ({
      customer_id: c.customerId,
      customer_code: c.customerCode,
      last_name: c.lastName || null,
      first_name: c.firstName || null,
      last_name_kana: c.lastNameKana || null,
      first_name_kana: c.firstNameKana || null,
      updated_at: new Date().toISOString(),
    }));

    const tempFile = `/tmp/bq_customers_${Date.now()}.jsonl`;

    try {
      // JSONL形式で一時ファイルに書き出し
      const jsonlData = rows.map((r) => JSON.stringify(r)).join("\n");
      await writeFile(tempFile, jsonlData);

      // Load Job実行
      const table = this.bigquery.dataset(this.datasetId).table("customers");
      const [job] = await table.load(tempFile, {
        sourceFormat: "NEWLINE_DELIMITED_JSON",
        writeDisposition: "WRITE_APPEND",
        autodetect: false,
        schema: customersSchema,
      });

      console.log(`  - Inserted ${rows.length} customers (Job: ${job.id})`);
    } catch (error: any) {
      console.error("  - Insert error:", error.message);
      throw error;
    } finally {
      // 一時ファイル削除
      try {
        await unlink(tempFile);
      } catch (e) {
        // ファイル削除失敗は無視
      }
    }
  }
}
