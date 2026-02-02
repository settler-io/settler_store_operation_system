/**
 * Cookie管理ユーティリティ
 */

import { readFileSync, writeFileSync, existsSync } from "fs";

const COOKIE_FILE = "twitter-cookies.json";

/**
 * Cookieをファイルに保存
 */
export function saveCookies(cookies: any[]): void {
  writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));
  console.log(`Cookies saved to ${COOKIE_FILE}`);
}

/**
 * Cookieをファイルから読み込み
 */
export function loadCookies(): any[] | null {
  if (!existsSync(COOKIE_FILE)) {
    return null;
  }

  try {
    const data = readFileSync(COOKIE_FILE, "utf-8");
    const cookies = JSON.parse(data);
    console.log(`Cookies loaded from ${COOKIE_FILE}`);
    return cookies;
  } catch (error) {
    console.error("Failed to load cookies:", error);
    return null;
  }
}

/**
 * Cookieファイルが存在するかチェック
 */
export function hasCookies(): boolean {
  return existsSync(COOKIE_FILE);
}
