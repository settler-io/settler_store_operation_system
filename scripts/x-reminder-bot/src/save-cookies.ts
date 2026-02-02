/**
 * 手動ログイン用スクリプト
 * このスクリプトを実行して、ブラウザで手動でTwitterにログインしてください。
 * ログイン後、Cookieが自動的に保存されます。
 */

import dotenv from "dotenv";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { saveCookies } from "./cookie-manager.js";

dotenv.config();

puppeteer.use(StealthPlugin());

async function main() {
  console.log("=== Twitter Cookie保存ツール ===");
  console.log("ブラウザが起動します。手動でTwitterにログインしてください。");
  console.log("ログイン後、Enterキーを押してください。\n");

  const browser = await puppeteer.launch({
    headless: false, // 手動ログインのため非ヘッドレスモード
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1920,1080",
    ],
  });

  const page = await browser.newPage();

  // Twitterログインページに移動
  await page.goto("https://x.com/i/flow/login", {
    waitUntil: "networkidle2",
  });

  console.log("ブラウザでログインしてください...");
  console.log("ログインが完了したら、このターミナルでEnterキーを押してください。");

  // ユーザーの入力を待つ
  await new Promise<void>((resolve) => {
    process.stdin.once("data", () => {
      resolve();
    });
  });

  // Cookieを取得して保存
  console.log("\nCookieを保存しています...");
  const cookies = await page.cookies();
  saveCookies(cookies);

  console.log("Cookieが保存されました！");
  console.log("これでbotがログインせずにTwitterにアクセスできます。");

  await browser.close();
  process.exit(0);
}

main().catch((error) => {
  console.error("エラーが発生しました:", error);
  process.exit(1);
});
