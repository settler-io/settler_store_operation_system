/**
 * スマレジプラットフォームAPI 初回セットアップスクリプト
 *
 * 使用方法:
 *   npm run setup
 *
 * このスクリプトは以下を行います:
 * 1. 一時的なローカルサーバーを起動
 * 2. 認可URLを表示
 * 3. ブラウザで認可後、自動的にコールバックを受け取る
 * 4. 認可コードをアクセストークンに交換
 * 5. トークンをファイルに保存
 */

import "dotenv/config";
import * as http from "http";
import { URL } from "url";
import { createSmaregiAuthFromEnv } from "./smaregi-auth.js";

const PORT = 3311;

async function main(): Promise<void> {
  console.log("========================================");
  console.log("スマレジプラットフォームAPI セットアップ");
  console.log("========================================\n");

  const auth = createSmaregiAuthFromEnv();

  // 既に認証済みかチェック
  if (auth.isAuthenticated()) {
    console.log("既に認証済みです。再認証する場合は .smaregi-token.json を削除してください。");
    process.exit(0);
  }

  // 認可コードを受け取るためのPromise
  const codePromise = new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || "", `http://localhost:${PORT}`);

      if (url.pathname === "/callback") {
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`<h1>エラー</h1><p>${error}</p><p>このウィンドウを閉じてください。</p>`);
          reject(new Error(`Authorization error: ${error}`));
          server.close();
          return;
        }

        if (code) {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`
            <html>
              <head><title>認証成功</title></head>
              <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                <h1>認証成功！</h1>
                <p>このウィンドウを閉じて、ターミナルに戻ってください。</p>
              </body>
            </html>
          `);
          resolve(code);
          // 少し待ってからサーバーを閉じる
          setTimeout(() => server.close(), 1000);
          return;
        }
      }

      // その他のリクエスト
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    });

    server.listen(PORT, () => {
      console.log(`コールバックサーバーを起動しました (http://localhost:${PORT})`);
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        reject(new Error(`ポート ${PORT} は既に使用されています。他のプロセスを終了してください。`));
      } else {
        reject(err);
      }
    });

    // タイムアウト（5分）
    setTimeout(() => {
      server.close();
      reject(new Error("タイムアウト: 5分以内に認可を完了してください。"));
    }, 5 * 60 * 1000);
  });

  // 認可URLを表示
  const authUrl = auth.getAuthorizationUrl();
  console.log("\n以下のURLをブラウザで開いて、アプリを認可してください:\n");
  console.log("----------------------------------------");
  console.log(authUrl);
  console.log("----------------------------------------\n");
  console.log("認可が完了するまで待機中...\n");

  try {
    // 認可コードを待つ
    const code = await codePromise;
    console.log("認可コードを受け取りました。トークンを取得中...\n");

    // トークンを取得
    const tokenData = await auth.exchangeCodeForToken(code);

    console.log("========================================");
    console.log("セットアップ完了！");
    console.log("========================================");
    console.log(`契約ID: ${tokenData.contractId}`);
    console.log(`トークン有効期限: ${tokenData.expiresAt}`);
    console.log("\nこれで日次レポートを実行できます:");
    console.log("  npm run dev   (開発モード)");
    console.log("  npm run start (本番モード)");
  } catch (error) {
    console.error("\nエラーが発生しました:", error);
    process.exit(1);
  }
}

main();
