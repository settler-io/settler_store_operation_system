/**
 * デバッグ用: 生のAPIレスポンスを表示
 */

import "dotenv/config";
import { createSmaregiAuthFromEnv } from "./smaregi-auth.js";

const API_BASE_URL =
  process.env.SMAREGI_USE_SANDBOX === "true"
    ? "https://api.smaregi.dev"
    : "https://api.smaregi.jp";

async function main(): Promise<void> {
  const storeId = process.argv[2]; // 引数から店舗ID取得

  console.log("スマレジAPI 生データ取得");
  console.log("========================\n");

  const auth = createSmaregiAuthFromEnv();
  const accessToken = await auth.getAccessToken();
  const contractId = auth.getContractId();

  // 日本時間（JST, UTC+9）で昨日の日付範囲を計算
  const now = new Date();
  const jstOffset = 9 * 60; // 日本時間は UTC+9時間
  const nowJST = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60 * 1000);

  const yesterday = new Date(nowJST);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const endDate = new Date(yesterday);
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

  const params = new URLSearchParams();
  params.set("transaction_date_time-from", formatDate(yesterday));
  params.set("transaction_date_time-to", formatDate(endDate));
  params.set("with_details", "all");
  params.set("limit", "100"); // デバッグ用
  if (storeId) {
    params.set("store_id", storeId);
  }

  const url = `${API_BASE_URL}/${contractId}/pos/transactions?${params.toString()}`;

  console.log(`URL: ${url}\n`);
  console.log(`店舗ID: ${storeId || "全店舗"}\n`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error: ${response.status} ${response.statusText}`);
    console.error(errorText);
    process.exit(1);
  }

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
