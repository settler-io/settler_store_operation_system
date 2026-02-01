require('dotenv').config();
const puppeteer = require('puppeteer');

const CONFIG = {
  loginUrl: process.env.LOGIN_URL || 'https://choose-monster-app.com',
  email: process.env.LOGIN_EMAIL,
  password: process.env.LOGIN_PASSWORD,
  discordWebhook: process.env.DISCORD_WEBHOOK_URL,
  // 監視対象のページURL（ログイン後にリダイレクトされるページ、または受注伝票ページ）
  targetUrl: process.env.TARGET_URL || 'https://choose-monster-app.com',
  // ページリロード間隔（ミリ秒）- セッション維持用
  reloadInterval: parseInt(process.env.RELOAD_INTERVAL) || 30 * 60 * 1000, // 30分
  // ヘッドレスモード（デバッグ時はfalseに）
  headless: process.env.HEADLESS !== 'false',
};

// 通知済みの注文IDを保持（重複通知防止）
const notifiedOrders = new Set();

async function sendDiscordNotification(orderData) {
  if (!CONFIG.discordWebhook) {
    console.log('[Discord] Webhook URL not configured, skipping notification');
    return;
  }

  try {
    const response = await fetch(CONFIG.discordWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: '注文通知Bot',
        embeds: [{
          title: '🍔 新しい注文が入りました！',
          color: 0xff6b35,
          fields: [
            {
              name: '注文番号',
              value: orderData.orderNumber || orderData.id || '不明',
              inline: true,
            },
            {
              name: '受付時間',
              value: orderData.timestamp || new Date().toLocaleString('ja-JP'),
              inline: true,
            },
            {
              name: '詳細',
              value: orderData.details || JSON.stringify(orderData, null, 2).slice(0, 1000),
            },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });

    if (response.ok) {
      console.log('[Discord] Notification sent successfully');
    } else {
      console.error('[Discord] Failed to send notification:', response.status);
    }
  } catch (error) {
    console.error('[Discord] Error sending notification:', error);
  }
}

async function login(page) {
  console.log('[Login] Navigating to login page...');
  await page.goto(CONFIG.loginUrl, { waitUntil: 'networkidle2', timeout: 60000 });

  // ページの読み込みを待つ
  await page.waitForTimeout(3000);

  // ログインフォームを探す（サイトの構造に応じて調整が必要）
  // 一般的なセレクタを試す
  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="メール"]',
    'input[placeholder*="email"]',
    '#email',
  ];

  const passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    '#password',
  ];

  let emailInput = null;
  let passwordInput = null;

  for (const selector of emailSelectors) {
    emailInput = await page.$(selector);
    if (emailInput) {
      console.log(`[Login] Found email input: ${selector}`);
      break;
    }
  }

  for (const selector of passwordSelectors) {
    passwordInput = await page.$(selector);
    if (passwordInput) {
      console.log(`[Login] Found password input: ${selector}`);
      break;
    }
  }

  if (!emailInput || !passwordInput) {
    console.log('[Login] Login form not found. Taking screenshot for debugging...');
    await page.screenshot({ path: 'debug-login.png', fullPage: true });
    console.log('[Login] Current URL:', page.url());

    // すでにログイン済みの可能性
    if (page.url().includes('order') || page.url().includes('dashboard')) {
      console.log('[Login] Already logged in or redirected to main page');
      return true;
    }

    throw new Error('Login form not found');
  }

  // メールとパスワードを入力
  await emailInput.click({ clickCount: 3 });
  await emailInput.type(CONFIG.email);

  await passwordInput.click({ clickCount: 3 });
  await passwordInput.type(CONFIG.password);

  // ログインボタンを探してクリック
  const submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("ログイン")',
    'button:has-text("Login")',
    '.login-button',
    '#login-button',
  ];

  for (const selector of submitSelectors) {
    try {
      const button = await page.$(selector);
      if (button) {
        console.log(`[Login] Clicking submit button: ${selector}`);
        await button.click();
        break;
      }
    } catch (e) {
      // セレクタが無効な場合はスキップ
    }
  }

  // ログイン完了を待つ
  console.log('[Login] Waiting for login to complete...');
  await page.waitForTimeout(5000);

  console.log('[Login] Current URL after login:', page.url());
  return true;
}

async function setupFirestoreListener(page) {
  console.log('[Monitor] Setting up Firestore listener...');

  // ページ内のコンソールログを監視
  page.on('console', async (msg) => {
    const text = msg.text();

    // order-tickets 関連のログを監視
    if (text.includes('order') || text.includes('ticket')) {
      console.log('[Console]', text);
    }
  });

  // CDPセッションを使ってネットワークリクエストを監視
  const client = await page.target().createCDPSession();
  await client.send('Network.enable');

  // Firestoreへのリクエストを監視
  client.on('Network.responseReceived', async (event) => {
    const url = event.response.url;

    if (url.includes('firestore.googleapis.com') && url.includes('Listen')) {
      console.log('[Firestore] Listen response detected');
    }
  });

  // ページ内でFirestoreのスナップショットリスナーをフック
  await page.exposeFunction('onOrderUpdate', async (orderData) => {
    console.log('[Order] New order detected:', orderData);

    const orderId = orderData.id || orderData.orderNumber || JSON.stringify(orderData);
    if (!notifiedOrders.has(orderId)) {
      notifiedOrders.add(orderId);
      await sendDiscordNotification(orderData);
    }
  });

  // Firestoreのデータ変更を検知するスクリプトを注入
  await page.evaluate(() => {
    // MutationObserverでDOM変更を監視（注文リストの変更を検知）
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 新しい注文要素を検知（クラス名やデータ属性で判断）
              const orderElement = node.querySelector?.('[class*="order"]') ||
                                   (node.className?.includes?.('order') ? node : null);
              if (orderElement) {
                console.log('[DOM] New order element detected');
                // window.onOrderUpdate を呼び出す
                if (window.onOrderUpdate) {
                  window.onOrderUpdate({
                    id: Date.now().toString(),
                    details: orderElement.textContent?.slice(0, 500) || 'New order',
                    timestamp: new Date().toLocaleString('ja-JP'),
                  });
                }
              }
            }
          });
        }
      });
    });

    // body全体を監視
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log('[Monitor] DOM observer started');
  });

  console.log('[Monitor] Firestore listener setup complete');
}

async function navigateToOrderPage(page) {
  // 受注伝票ページへ移動（URLは環境変数で設定可能）
  if (CONFIG.targetUrl && CONFIG.targetUrl !== CONFIG.loginUrl) {
    console.log('[Navigate] Going to target page:', CONFIG.targetUrl);
    await page.goto(CONFIG.targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(3000);
  }

  console.log('[Navigate] Current URL:', page.url());
}

async function main() {
  console.log('='.repeat(50));
  console.log('[Start] Order Monitor starting...');
  console.log('[Config] Headless:', CONFIG.headless);
  console.log('[Config] Login URL:', CONFIG.loginUrl);
  console.log('[Config] Discord Webhook:', CONFIG.discordWebhook ? 'Configured' : 'Not configured');
  console.log('='.repeat(50));

  if (!CONFIG.email || !CONFIG.password) {
    console.error('[Error] LOGIN_EMAIL and LOGIN_PASSWORD must be set in .env file');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // ユーザーエージェントを設定
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  try {
    // ログイン
    await login(page);

    // 受注伝票ページへ移動
    await navigateToOrderPage(page);

    // Firestoreリスナーをセットアップ
    await setupFirestoreListener(page);

    console.log('[Monitor] Now monitoring for new orders...');
    console.log('[Monitor] Press Ctrl+C to stop');

    // 定期的なページリロード（セッション維持）
    setInterval(async () => {
      console.log('[Reload] Refreshing page to maintain session...');
      try {
        await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
        await setupFirestoreListener(page);
        console.log('[Reload] Page refreshed successfully');
      } catch (error) {
        console.error('[Reload] Error refreshing page:', error.message);
      }
    }, CONFIG.reloadInterval);

    // プロセスを終了させない
    await new Promise(() => {});

  } catch (error) {
    console.error('[Error] Fatal error:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    await browser.close();
    process.exit(1);
  }
}

// 終了シグナルのハンドリング
process.on('SIGINT', () => {
  console.log('\n[Exit] Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Exit] Received SIGTERM, shutting down...');
  process.exit(0);
});

main().catch(console.error);
