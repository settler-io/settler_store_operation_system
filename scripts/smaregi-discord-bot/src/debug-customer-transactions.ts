/**
 * デバッグ用: 顧客IDで取引履歴を取得
 */

import "dotenv/config";
import { createSmaregiAuthFromEnv } from "./smaregi-auth.js";

const API_BASE_URL =
  process.env.SMAREGI_USE_SANDBOX === "true"
    ? "https://api.smaregi.dev"
    : "https://api.smaregi.jp";

async function main(): Promise<void> {
  const customerCode = process.argv[2] || "000000000137"; // デフォルトは橋本さんのコード

  console.log(`顧客コード ${customerCode} の過去3ヶ月取引履歴を取得中...\n`);

  const auth = createSmaregiAuthFromEnv();
  const accessToken = await auth.getAccessToken();
  const contractId = auth.getContractId();

  const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
  };

  const now = new Date();
  const uniqueDates = new Set<string>();

  // 過去3ヶ月を30日ずつ3回に分けて取得
  const periods = [
    { daysAgo: 0 },   // 直近30日
    { daysAgo: 30 },  // 30-60日前
    { daysAgo: 60 },  // 60-90日前
  ];

  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    const toDate = new Date(now);
    toDate.setDate(toDate.getDate() - period.daysAgo);
    const fromDate = new Date(toDate);
    fromDate.setDate(fromDate.getDate() - 30);

    console.log(`期間${i + 1}: ${formatDate(fromDate)} ～ ${formatDate(toDate)}`);

    const params = new URLSearchParams();
    params.set("customer_code", customerCode);
    params.set("transaction_date_time-from", formatDate(fromDate));
    params.set("transaction_date_time-to", formatDate(toDate));
    params.set("limit", "100");

    const url = `${API_BASE_URL}/${contractId}/pos/transactions?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json() as any;
      const transactions = Array.isArray(data) ? data : (data.result || []);
      console.log(`  取得件数: ${transactions.length}件`);

      for (const transaction of transactions) {
        const date = transaction.transactionDateTime?.split("T")[0];
        if (date) {
          uniqueDates.add(date);
        }
      }
    } else {
      const errorText = await response.text();
      console.log(`  エラー: ${errorText.slice(0, 200)}`);
    }
  }

  console.log(`\n過去3ヶ月間の来店回数: ${uniqueDates.size}回`);
}

main().catch(console.error);
