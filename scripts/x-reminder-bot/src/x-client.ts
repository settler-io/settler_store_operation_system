/**
 * X (Twitter) Webスクレイピングクライアント（ログイン機能付き）
 */

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, Page } from "puppeteer";
import { loadCookies, saveCookies, hasCookies } from "./cookie-manager.js";

// Stealthプラグインを使用してbot検出を回避
puppeteer.use(StealthPlugin());

export interface XPost {
  id: string;
  text: string;
  createdAt: Date;
}

export class XClient {
  private username: string;
  private loginEmail: string;
  private loginPassword: string;
  private browser: Browser | null = null;
  private isLoggedIn: boolean = false;

  constructor(username: string, loginEmail: string, loginPassword: string) {
    this.username = username;
    this.loginEmail = loginEmail;
    this.loginPassword = loginPassword;
  }

  /**
   * ブラウザを起動
   */
  private async launchBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: "shell", // 新しいヘッドレスモード（より検出されにくい）
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
      this.isLoggedIn = false;
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
   * ランダムなマウス移動（人間らしい動作）
   */
  private async randomMouseMove(page: Page): Promise<void> {
    const x = Math.floor(Math.random() * 800) + 100;
    const y = Math.floor(Math.random() * 600) + 100;
    await page.mouse.move(x, y, { steps: 10 });
  }

  /**
   * Twitterにログイン
   */
  private async login(page: Page): Promise<void> {
    if (this.isLoggedIn) {
      return;
    }

    console.log("Logging in to Twitter...");

    // 保存されたCookieがあれば使用
    const savedCookies = loadCookies();
    if (savedCookies) {
      console.log("Using saved cookies for authentication...");
      try {
        // Cookieを設定（partitionKeyを除外）
        const cookiesWithoutPartitionKey = savedCookies.map(cookie => {
          const { partitionKey, ...rest } = cookie as any;
          return rest;
        });
        await page.setCookie(...cookiesWithoutPartitionKey);

        // Twitterのホームページに移動して、ログインできているか確認
        await page.goto("https://x.com/home", {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        await this.randomDelay(2000, 4000);

        // URLがホームページのままならログイン成功
        const currentUrl = page.url();
        if (currentUrl.includes("/home")) {
          console.log("Successfully logged in using cookies!");
          this.isLoggedIn = true;
          return;
        } else {
          console.log("Saved cookies are invalid or expired, attempting manual login...");
        }
      } catch (error) {
        console.log("Failed to use saved cookies, attempting manual login...", error);
      }
    }

    try {
      // WebGL、Canvas、その他のフィンガープリント対策を注入
      await page.evaluateOnNewDocument(() => {
        // @ts-ignore - このコードはブラウザコンテキストで実行される
        // Webdriver検出を完全に隠す
        Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', {
          get: () => false,
        });

        // @ts-ignore - このコードはブラウザコンテキストで実行される
        // Chrome特有のプロパティを追加
        window.chrome = {
          runtime: {},
        };

        // @ts-ignore - このコードはブラウザコンテキストで実行される
        // Permissions APIをモック
        const originalQuery = window.navigator.permissions.query;
        // @ts-ignore
        window.navigator.permissions.query = (parameters: any) =>
          parameters.name === 'notifications'
            ? Promise.resolve({ state: 'denied' })
            : originalQuery(parameters);

        // @ts-ignore - このコードはブラウザコンテキストで実行される
        // Pluginsを追加
        Object.defineProperty(Object.getPrototypeOf(navigator), 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });

        // @ts-ignore - このコードはブラウザコンテキストで実行される
        // Languages
        Object.defineProperty(Object.getPrototypeOf(navigator), 'languages', {
          get: () => ['ja-JP', 'ja', 'en-US', 'en'],
        });
      });

      // User-Agentを設定（最新のChrome）
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
      );

      // 追加のヘッダーを設定
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      });

      // ログインページに移動
      await page.goto("https://x.com/i/flow/login", {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      // ランダムに待機（人間らしい）
      await this.randomDelay(3000, 5000);

      // ランダムなマウス移動
      await this.randomMouseMove(page);
      await this.randomDelay(500, 1000);

      // デバッグ: スクリーンショット1
      await page.screenshot({ path: "debug-login-1-start.png" });
      console.log("Screenshot saved: debug-login-1-start.png");

      // メールアドレス/ユーザー名入力
      console.log("Entering email/username...");

      // より柔軟なセレクタで試行
      const usernameInput = await page.waitForSelector(
        'input[autocomplete="username"], input[name="text"], input[autocomplete="email"]',
        { timeout: 30000 }
      );

      // マウスを入力フィールドに移動してからクリック
      const inputBox = await usernameInput?.boundingBox();
      if (inputBox) {
        await page.mouse.move(
          inputBox.x + inputBox.width / 2,
          inputBox.y + inputBox.height / 2,
          { steps: 15 }
        );
        await this.randomDelay(200, 500);
      }

      // フィールドをクリックしてフォーカスを確実に当てる
      await usernameInput?.click();
      await this.randomDelay(300, 700);

      // フィールドをクリアしてから入力
      await usernameInput?.click({ clickCount: 3 }); // トリプルクリックで全選択
      await this.randomDelay(100, 300);
      await page.keyboard.press('Backspace');
      await this.randomDelay(200, 400);

      // ゆっくり入力（ランダムなdelay）
      for (const char of this.loginEmail) {
        await page.keyboard.type(char);
        await this.randomDelay(80, 200);
      }

      // デバッグ: スクリーンショット2
      await page.screenshot({ path: "debug-login-2-username.png" });
      console.log("Screenshot saved: debug-login-2-username.png");

      // 「次へ」ボタンを探してクリック
      await this.randomDelay(1500, 2500);

      // ランダムなマウス移動
      await this.randomMouseMove(page);
      await this.randomDelay(300, 700);

      console.log("Looking for Next button...");

      // ボタンを探して、マウスを移動してクリック
      const nextButton = await page.evaluateHandle(() => {
        // @ts-ignore - このコードはブラウザコンテキストで実行される
        const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'));
        // @ts-ignore
        return buttons.find((btn: any) =>
          btn.textContent?.toLowerCase().includes('next') ||
          btn.textContent?.includes('次へ')
        );
      });

      if (nextButton) {
        const nextButtonElement = nextButton.asElement();
        if (nextButtonElement) {
          const buttonBox = await nextButtonElement.boundingBox();
          if (buttonBox) {
            // ボタンにマウスを移動
            await page.mouse.move(
              buttonBox.x + buttonBox.width / 2,
              buttonBox.y + buttonBox.height / 2,
              { steps: 20 }
            );
            await this.randomDelay(200, 500);

            // クリック
            await nextButtonElement.click();
            console.log("Next button clicked!");
          }
        }
      } else {
        console.log("Next button not found, trying Enter key...");
        await this.randomDelay(300, 600);
        await page.keyboard.press("Enter");
      }

      // 次の画面を待機
      await this.randomDelay(5000, 8000);

      // デバッグ: スクリーンショット3
      await page.screenshot({ path: "debug-login-3-after-username.png" });
      console.log("Screenshot saved: debug-login-3-after-username.png");

      // デバッグ: ページのHTMLを保存
      const html3 = await page.content();
      const fs = await import("fs");
      fs.writeFileSync("debug-login-3-html.txt", html3);
      console.log("HTML saved: debug-login-3-html.txt");

      // デバッグ: エラーメッセージを確認
      const errorMessages = await page.evaluate(() => {
        // @ts-ignore - このコードはブラウザコンテキストで実行される
        const errors = document.querySelectorAll('[role="alert"], [data-testid="error"], .error, [class*="error"]');
        // @ts-ignore
        return Array.from(errors).map((el: any) => el.textContent);
      });

      if (errorMessages.length > 0) {
        console.log("Error messages found:", errorMessages);
      }

      // ユーザー名確認が求められる場合がある
      const usernameVerification = await page.$('input[data-testid="ocfEnterTextTextInput"]');
      if (usernameVerification) {
        console.log("Username verification required, entering username...");

        // マウスを入力フィールドに移動してからクリック
        const verificationBox = await usernameVerification.boundingBox();
        if (verificationBox) {
          await page.mouse.move(
            verificationBox.x + verificationBox.width / 2,
            verificationBox.y + verificationBox.height / 2,
            { steps: 15 }
          );
          await this.randomDelay(200, 500);
        }

        // フィールドをクリックしてフォーカスを確実に当てる
        await usernameVerification.click();
        await this.randomDelay(400, 800);

        // ゆっくり入力（ランダムなdelay）
        for (const char of this.username) {
          await page.keyboard.type(char);
          await this.randomDelay(80, 200);
        }

        await this.randomDelay(1500, 2500);
        await page.keyboard.press("Enter");
        await this.randomDelay(4000, 6000);

        // デバッグ: スクリーンショット4
        await page.screenshot({ path: "debug-login-4-after-verification.png" });
        console.log("Screenshot saved: debug-login-4-after-verification.png");
      }

      // パスワード入力
      console.log("Entering password...");

      // より柔軟なセレクタで試行
      const passwordInput = await page.waitForSelector(
        'input[name="password"], input[type="password"], input[autocomplete="current-password"]',
        { timeout: 30000 }
      );

      // マウスを入力フィールドに移動してからクリック
      const passwordBox = await passwordInput?.boundingBox();
      if (passwordBox) {
        await page.mouse.move(
          passwordBox.x + passwordBox.width / 2,
          passwordBox.y + passwordBox.height / 2,
          { steps: 15 }
        );
        await this.randomDelay(200, 500);
      }

      // フィールドをクリックしてフォーカスを確実に当てる
      await passwordInput?.click();
      await this.randomDelay(400, 800);

      // ゆっくり入力（ランダムなdelay）
      for (const char of this.loginPassword) {
        await page.keyboard.type(char);
        await this.randomDelay(80, 200);
      }

      // デバッグ: スクリーンショット5
      await page.screenshot({ path: "debug-login-5-password.png" });
      console.log("Screenshot saved: debug-login-5-password.png");

      // ログインボタンをクリック
      await this.randomDelay(1500, 2500);
      await page.keyboard.press("Enter");

      // ログイン完了を待機
      await this.randomDelay(6000, 10000);

      // デバッグ: スクリーンショット6
      await page.screenshot({ path: "debug-login-6-complete.png" });
      console.log("Screenshot saved: debug-login-6-complete.png");

      // ログイン成功の確認（ホームページに遷移しているか）
      const currentUrl = page.url();
      console.log(`Current URL after login: ${currentUrl}`);

      if (currentUrl.includes("/home") || currentUrl === "https://x.com/") {
        console.log("Login successful!");
        this.isLoggedIn = true;

        // Cookieを保存
        const cookies = await page.cookies();
        saveCookies(cookies);
        console.log("Cookies saved for future use");
      } else {
        throw new Error("Login failed: unexpected URL " + currentUrl);
      }
    } catch (error) {
      console.error("Login error:", error);

      // エラー時もスクリーンショットを保存
      try {
        await page.screenshot({ path: "debug-login-error.png" });
        console.log("Error screenshot saved: debug-login-error.png");
      } catch (screenshotError) {
        console.error("Failed to save error screenshot:", screenshotError);
      }

      throw new Error("Failed to login to Twitter: " + error);
    }
  }

  /**
   * 指定したユーザーのツイートを取得
   */
  async getUserTweets(sinceDate: Date): Promise<XPost[]> {
    const browser = await this.launchBrowser();
    const page = await browser.newPage();

    try {
      // User-Agentを設定（最新のChrome）
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
      );

      // タイムアウトを設定
      page.setDefaultTimeout(30000);

      // ログイン
      await this.login(page);

      // ユーザーのプロフィールページに移動
      console.log(`Navigating to https://x.com/${this.username}`);
      await page.goto(`https://x.com/${this.username}`, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      // ページが読み込まれるまで待機
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 指定日時まで遡ってツイートを取得
      const allTweets = await this.scrollAndCollectTweets(page, sinceDate);

      console.log(`Found ${allTweets.length} tweets on the page`);

      // XPostオブジェクトに変換し、日付でフィルタリング
      const posts: XPost[] = allTweets
        .map((tweet, index) => ({
          id: `tweet-${index}`,
          text: tweet.text,
          createdAt: new Date(tweet.time),
        }))
        .filter((post) => post.createdAt >= sinceDate);

      return posts;
    } catch (error) {
      console.error("Failed to fetch tweets:", error);
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * 指定日時まで遡ってツイートを収集
   */
  private async scrollAndCollectTweets(
    page: Page,
    sinceDate: Date
  ): Promise<{ text: string; time: string }[]> {
    const MAX_SCROLLS = 30;
    const SCROLL_DELAY = 2000;
    let scrollCount = 0;
    let previousTweetCount = 0;
    let noNewTweetsCount = 0;

    console.log(
      `Target date: ${sinceDate.toISOString()}, scrolling until we find older tweets...`
    );

    while (scrollCount < MAX_SCROLLS) {
      // 現在のツイートを取得
      const tweets = await page.evaluate(() => {
        // @ts-ignore - このコードはブラウザコンテキストで実行される
        const articles = document.querySelectorAll(
          'article[data-testid="tweet"]'
        );
        const results: { text: string; time: string }[] = [];

        // @ts-ignore
        articles.forEach((article: any) => {
          try {
            const textElement = article.querySelector(
              '[data-testid="tweetText"]'
            );
            const text = textElement?.textContent || "";

            const timeElement = article.querySelector("time");
            const time = timeElement?.getAttribute("datetime") || "";

            if (text && time) {
              results.push({ text, time });
            }
          } catch (error) {
            // Skip errors
          }
        });

        return results;
      });

      // 最も古いツイートの日付を確認
      if (tweets.length > 0) {
        const oldestTweet = tweets[tweets.length - 1];
        const oldestDate = new Date(oldestTweet.time);

        console.log(
          `Scroll ${scrollCount + 1}: Found ${tweets.length} tweets, oldest: ${oldestDate.toISOString()}`
        );

        // 指定日時より古いツイートが見つかったら終了
        if (oldestDate < sinceDate) {
          console.log(
            `Found tweets older than target date. Stopping scroll.`
          );
          return tweets;
        }
      }

      // 新しいツイートが読み込まれていない場合のカウント
      if (tweets.length === previousTweetCount) {
        noNewTweetsCount++;
        if (noNewTweetsCount >= 3) {
          console.log(`No new tweets loaded after 3 scrolls. Stopping.`);
          return tweets;
        }
      } else {
        noNewTweetsCount = 0;
        previousTweetCount = tweets.length;
      }

      // スクロール
      await page.evaluate(() => {
        // @ts-ignore - このコードはブラウザコンテキストで実行される
        window.scrollBy(0, window.innerHeight);
      });

      // 待機
      await new Promise((resolve) => setTimeout(resolve, SCROLL_DELAY));

      scrollCount++;
    }

    // 最大スクロール回数に達した場合、最後に取得したツイートを返す
    console.log(`Reached max scroll count (${MAX_SCROLLS}). Stopping.`);
    const finalTweets = await page.evaluate(() => {
      // @ts-ignore - このコードはブラウザコンテキストで実行される
      const articles = document.querySelectorAll(
        'article[data-testid="tweet"]'
      );
      const results: { text: string; time: string }[] = [];

      // @ts-ignore
      articles.forEach((article: any) => {
        try {
          const textElement = article.querySelector(
            '[data-testid="tweetText"]'
          );
          const text = textElement?.textContent || "";

          const timeElement = article.querySelector("time");
          const time = timeElement?.getAttribute("datetime") || "";

          if (text && time) {
            results.push({ text, time });
          }
        } catch (error) {
          // Skip errors
        }
      });

      return results;
    });

    return finalTweets;
  }

  /**
   * 今日のツイートから条件に一致するものをフィルタリング
   */
  filterPostsByKeyword(posts: XPost[], keyword: string): XPost[] {
    return posts.filter((post) => post.text.includes(keyword));
  }
}

/**
 * 環境変数からXClientインスタンスを作成
 */
export function createXClientFromEnv(): XClient {
  const username = process.env.TWITTER_USERNAME;
  const loginEmail = process.env.TWITTER_LOGIN_EMAIL;
  const loginPassword = process.env.TWITTER_LOGIN_PASSWORD;

  if (!username) {
    throw new Error("Missing required environment variable: TWITTER_USERNAME");
  }

  if (!loginEmail) {
    throw new Error("Missing required environment variable: TWITTER_LOGIN_EMAIL");
  }

  if (!loginPassword) {
    throw new Error("Missing required environment variable: TWITTER_LOGIN_PASSWORD");
  }

  return new XClient(username, loginEmail, loginPassword);
}
