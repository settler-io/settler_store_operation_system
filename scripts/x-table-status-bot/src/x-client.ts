/**
 * X (Twitter) クライアント
 * X API v2を使用した投稿とスクリーンショット取得
 */

import { TwitterApi } from "twitter-api-v2";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer";

// Stealthプラグインを使用してbot検出を回避（スクリーンショット用）
puppeteer.use(StealthPlugin());

export class XClient {
  private client: TwitterApi;
  private browser: Browser | null = null;

  constructor(
    apiKey: string,
    apiSecret: string,
    accessToken: string,
    accessTokenSecret: string
  ) {
    // X API v2クライアントを初期化
    this.client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });
  }

  /**
   * ブラウザを起動（スクリーンショット用）
   */
  private async launchBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: "shell",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-blink-features=AutomationControlled",
          "--disable-features=IsolateOrigins,site-per-process",
          "--window-size=1920,1080",
          "--lang=ja-JP",
          "--disable-web-security",
          "--disable-infobars",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-features=TranslateUI",
          "--disable-ipc-flooding-protection",
          "--disable-popup-blocking",
          "--disable-prompt-on-repost",
          "--disable-sync",
          "--force-color-profile=srgb",
          "--metrics-recording-only",
          "--no-first-run",
          "--enable-automation=false",
          "--password-store=basic",
          "--use-mock-keychain",
          "--hide-scrollbars",
          "--mute-audio",
        ],
        ignoreDefaultArgs: ["--enable-automation"],
      });
    }
    return this.browser;
  }

  /**
   * ブラウザを閉じる
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * ランダムな遅延を追加（人間らしい動作）
   */
  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Webページのスクリーンショットを取得
   */
  async captureScreenshot(url: string): Promise<Buffer> {
    const browser = await this.launchBrowser();
    const page = await browser.newPage();

    try {
      console.log(`Capturing screenshot of ${url}...`);

      // ビューポートサイズを設定（PC表示）
      await page.setViewport({
        width: 1920,
        height: 850,
        deviceScaleFactor: 1,
      });

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // ページが完全に読み込まれるまで待機
      await this.randomDelay(3000, 5000);

      // スクロール量を環境変数から取得（デフォルト: 500px）
      const scrollAmount = parseInt(process.env.SCREENSHOT_SCROLL_Y || "500", 10);
      if (scrollAmount > 0) {
        console.log(`Scrolling down by ${scrollAmount}px...`);
        await page.evaluate((amount) => {
          // @ts-ignore - このコードはブラウザコンテキストで実行される
          window.scrollTo(0, amount);
        }, scrollAmount);

        // スクロール後、少し待機
        await this.randomDelay(1000, 2000);
      }

      // スクリーンショットを取得
      const screenshot = await page.screenshot({
        type: "png",
        fullPage: false, // ビューポート内のみ
      });

      console.log("Screenshot captured successfully");
      return screenshot as Buffer;
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * 画像をX API v1.1経由でアップロード
   */
  private async uploadMedia(imageBuffer: Buffer): Promise<string> {
    try {
      console.log("Uploading media to X...");

      // X API v1.1のメディアアップロードを使用
      const mediaId = await this.client.v1.uploadMedia(imageBuffer, {
        mimeType: "image/png",
      });

      console.log(`Media uploaded successfully: ${mediaId}`);
      return mediaId;
    } catch (error) {
      console.error("Failed to upload media:", error);
      throw error;
    }
  }

  /**
   * テキストと画像をX API v2で投稿
   */
  async postTweet(text: string, imageBuffer?: Buffer): Promise<void> {
    try {
      console.log("Posting tweet via X API v2...");

      // 画像がある場合は先にアップロードして投稿
      if (imageBuffer) {
        const mediaId = await this.uploadMedia(imageBuffer);

        // ツイートを投稿（画像付き）
        const tweet = await this.client.v2.tweet({
          text: text,
          media: { media_ids: [mediaId] },
        });

        console.log(`Tweet posted successfully! Tweet ID: ${tweet.data.id}`);
        console.log(`URL: https://twitter.com/i/web/status/${tweet.data.id}`);
      } else {
        // ツイートを投稿（画像なし）
        const tweet = await this.client.v2.tweet(text);

        console.log(`Tweet posted successfully! Tweet ID: ${tweet.data.id}`);
        console.log(`URL: https://twitter.com/i/web/status/${tweet.data.id}`);
      }
    } catch (error) {
      console.error("Failed to post tweet:", error);

      // エラー詳細を表示
      if (error && typeof error === "object" && "data" in error) {
        console.error("Error details:", JSON.stringify(error.data, null, 2));
      }

      throw error;
    }
  }
}

/**
 * 環境変数からXClientインスタンスを作成
 */
export function createXClientFromEnv(): XClient {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey) {
    throw new Error("Missing required environment variable: TWITTER_API_KEY");
  }

  if (!apiSecret) {
    throw new Error("Missing required environment variable: TWITTER_API_SECRET");
  }

  if (!accessToken) {
    throw new Error(
      "Missing required environment variable: TWITTER_ACCESS_TOKEN"
    );
  }

  if (!accessTokenSecret) {
    throw new Error(
      "Missing required environment variable: TWITTER_ACCESS_TOKEN_SECRET"
    );
  }

  return new XClient(apiKey, apiSecret, accessToken, accessTokenSecret);
}
