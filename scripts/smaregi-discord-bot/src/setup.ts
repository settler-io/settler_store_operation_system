/**
 * スマレジプラットフォームAPI 接続テストスクリプト
 *
 * Client Credentials Grant を使用するため、ユーザー認可は不要です。
 * このスクリプトは環境変数の設定確認と接続テストを行います。
 *
 * 使用方法:
 *   npm run setup
 */

import "dotenv/config";
import { createSmaregiAuthFromEnv } from "./smaregi-auth.js";

async function main(): Promise<void> {
  console.log("========================================");
  console.log("スマレジプラットフォームAPI 接続テスト");
  console.log("========================================\n");

  try {
    // 環境変数チェック
    const requiredEnvVars = [
      "SMAREGI_CLIENT_ID",
      "SMAREGI_CLIENT_SECRET",
      "SMAREGI_CONTRACT_ID",
    ];

    const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
    if (missingVars.length > 0) {
      console.error("以下の環境変数が設定されていません:");
      missingVars.forEach((v) => console.error(`  - ${v}`));
      console.error("\n.env ファイルを確認してください。");
      process.exit(1);
    }

    console.log("環境変数チェック: OK\n");

    // 認証インスタンス作成
    const auth = createSmaregiAuthFromEnv();
    console.log(`契約ID: ${auth.getContractId()}\n`);

    // トークン取得テスト
    console.log("アクセストークンを取得中...");
    const token = await auth.getAccessToken();
    console.log(`トークン取得: OK (${token.substring(0, 20)}...)\n`);

    console.log("========================================");
    console.log("接続テスト完了！");
    console.log("========================================");
    console.log("\nこれで日次レポートを実行できます:");
    console.log("  npm run dev   (開発モード)");
    console.log("  npm run start (本番モード)");
  } catch (error) {
    console.error("\nエラーが発生しました:", error);
    process.exit(1);
  }
}

main();
