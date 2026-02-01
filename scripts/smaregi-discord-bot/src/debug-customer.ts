/**
 * デバッグ用: 顧客マスタAPIのレスポンスを確認
 */

import "dotenv/config";
import { createSmaregiAuthFromEnv } from "./smaregi-auth.js";

const API_BASE_URL =
  process.env.SMAREGI_USE_SANDBOX === "true"
    ? "https://api.smaregi.dev"
    : "https://api.smaregi.jp";

async function main(): Promise<void> {
  const customerId = process.argv[2] || "142"; // デフォルトは橋本さんのID

  console.log(`顧客ID ${customerId} の情報を取得中...\n`);

  const auth = createSmaregiAuthFromEnv();
  const accessToken = await auth.getAccessToken();
  const contractId = auth.getContractId();

  const url = `${API_BASE_URL}/${contractId}/pos/customers/${customerId}`;
  console.log(`URL: ${url}\n`);

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
  console.log("顧客マスタAPIレスポンス:");
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
