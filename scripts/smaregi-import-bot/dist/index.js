/**
 * スマレジBigQueryインポートBot
 *
 * 使用方法:
 * - 日次同期: npm run sync-daily
 * - 過去データ一括取得: npm run sync-historical
 */
import dotenv from "dotenv";
import { SmaregiPlatformAuth } from "./smaregi-auth.js";
import { SmaregiClient } from "./smaregi-client.js";
import { BigQueryClient } from "./bigquery-client.js";
dotenv.config();
// 環境変数の検証
function validateEnv() {
    const required = [
        "SMAREGI_CLIENT_ID",
        "SMAREGI_CLIENT_SECRET",
        "SMAREGI_CONTRACT_ID",
        "GCP_PROJECT_ID",
        "BIGQUERY_DATASET",
        "GOOGLE_APPLICATION_CREDENTIALS",
    ];
    for (const key of required) {
        if (!process.env[key]) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }
}
/**
 * 日次同期（昨日のデータを同期）
 */
async function syncDaily() {
    console.log("=== 日次同期開始 ===");
    const auth = new SmaregiPlatformAuth({
        clientId: process.env.SMAREGI_CLIENT_ID,
        clientSecret: process.env.SMAREGI_CLIENT_SECRET,
        contractId: process.env.SMAREGI_CONTRACT_ID,
        tokenFilePath: process.env.SMAREGI_TOKEN_FILE || "./.smaregi-token.json",
        useSandbox: process.env.SMAREGI_USE_SANDBOX === "true",
    });
    const smaregiClient = new SmaregiClient(auth);
    const bqClient = new BigQueryClient(process.env.GCP_PROJECT_ID, process.env.BIGQUERY_DATASET, process.env.GOOGLE_APPLICATION_CREDENTIALS);
    // テーブルの存在確認・作成
    await bqClient.ensureAllTables();
    // JST時刻で昨日の日付を計算
    const now = new Date();
    const jstOffset = 9 * 60;
    const nowJST = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60 * 1000);
    const yesterday = new Date(nowJST);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const dateStr = yesterday.toISOString().split("T")[0];
    console.log(`同期対象日: ${dateStr}`);
    // 取引データ取得
    const storeId = process.env.STORE_ID;
    console.log(`取引データ取得中... ${storeId ? `(店舗ID: ${storeId})` : "(全店舗)"}`);
    const transactions = await smaregiClient.getTransactions(yesterday, storeId);
    console.log(`取得した取引数: ${transactions.length}`);
    if (transactions.length === 0) {
        console.log("取引データがありません。");
        return;
    }
    // 取引ヘッダーをBigQueryに挿入（昨日のパーティションを上書き）
    await bqClient.insertTransactions(transactions);
    // 取引明細を抽出してBigQueryに挿入（昨日のパーティションを上書き）
    const details = smaregiClient.extractTransactionDetails(transactions);
    await bqClient.insertTransactionDetails(details);
    // 顧客データを取得してBigQueryに挿入
    const customerIds = smaregiClient.extractCustomerIds(transactions);
    if (customerIds.length > 0) {
        console.log(`顧客データ取得中... (${customerIds.length}名)`);
        const customers = await smaregiClient.getCustomers(customerIds);
        await bqClient.upsertCustomers(Array.from(customers.values()));
    }
    console.log("=== 日次同期完了 ===");
}
/**
 * 過去データ一括取得
 */
async function syncHistorical() {
    console.log("=== 過去データ一括取得開始 ===");
    const auth = new SmaregiPlatformAuth({
        clientId: process.env.SMAREGI_CLIENT_ID,
        clientSecret: process.env.SMAREGI_CLIENT_SECRET,
        contractId: process.env.SMAREGI_CONTRACT_ID,
        tokenFilePath: process.env.SMAREGI_TOKEN_FILE || "./.smaregi-token.json",
        useSandbox: process.env.SMAREGI_USE_SANDBOX === "true",
    });
    const smaregiClient = new SmaregiClient(auth);
    const bqClient = new BigQueryClient(process.env.GCP_PROJECT_ID, process.env.BIGQUERY_DATASET, process.env.GOOGLE_APPLICATION_CREDENTIALS);
    // テーブルの存在確認・作成
    await bqClient.ensureAllTables();
    // 開始日と終了日を設定
    const startDateStr = process.env.HISTORICAL_START_DATE || "2024-01-01";
    const startDate = new Date(startDateStr);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // 昨日まで
    console.log(`同期期間: ${startDateStr} 〜 ${endDate.toISOString().split("T")[0]}`);
    const storeId = process.env.STORE_ID;
    const currentDate = new Date(startDate);
    let totalTransactions = 0;
    let totalDetails = 0;
    let totalCustomers = 0;
    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        console.log(`\n処理中: ${dateStr}`);
        try {
            // 取引データ取得
            const transactions = await smaregiClient.getTransactions(currentDate, storeId);
            console.log(`  - 取得した取引数: ${transactions.length}`);
            if (transactions.length > 0) {
                // 取引ヘッダーをBigQueryに挿入
                await bqClient.insertTransactions(transactions);
                totalTransactions += transactions.length;
                // 取引明細を抽出してBigQueryに挿入
                const details = smaregiClient.extractTransactionDetails(transactions);
                await bqClient.insertTransactionDetails(details);
                totalDetails += details.length;
                // 顧客データを取得してBigQueryに挿入
                const customerIds = smaregiClient.extractCustomerIds(transactions);
                if (customerIds.length > 0) {
                    const customers = await smaregiClient.getCustomers(customerIds);
                    await bqClient.upsertCustomers(Array.from(customers.values()));
                    totalCustomers += customers.size;
                }
            }
        }
        catch (error) {
            console.error(`  - エラー: ${error}`);
        }
        // 次の日へ
        currentDate.setDate(currentDate.getDate() + 1);
        // APIレート制限対策: 少し待つ
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    console.log("\n=== 過去データ一括取得完了 ===");
    console.log(`総取引数: ${totalTransactions}`);
    console.log(`総取引明細数: ${totalDetails}`);
    console.log(`総顧客数: ${totalCustomers}`);
}
/**
 * メイン処理
 */
async function main() {
    try {
        validateEnv();
        const args = process.argv.slice(2);
        const mode = args.find((arg) => arg.startsWith("--mode="))?.split("=")[1] || "daily";
        if (mode === "daily") {
            await syncDaily();
        }
        else if (mode === "historical") {
            await syncHistorical();
        }
        else {
            console.error(`Unknown mode: ${mode}`);
            console.log("Usage:");
            console.log("  npm run sync-daily      # 昨日のデータを同期");
            console.log("  npm run sync-historical # 過去データを一括取得");
            process.exit(1);
        }
    }
    catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}
main();
