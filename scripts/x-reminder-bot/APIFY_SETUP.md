# Apifyを使用したTwitterスクレイピングの設定

PuppeteerによるTwitterのbot検出問題を解決するため、Apifyの専門スクレイピングサービスを使用します。

## なぜApifyを使うのか？

### 問題点
- Puppeteerで直接スクレイピングすると、Twitterがbotとして検出してツイートを隠す
- Cookie認証でも、特定のツイート（例：16:17の「店内状況」ツイート）が取得できない
- `apidojo/tweet-scraper` は定期モニタリング用途を禁止している（利用規約違反でrate limit）

### Apifyの利点
- Twitterのbot検出を完全回避
- 信頼性の高いデータ取得
- モニタリング用途に対応（`xtdata/twitter-x-scraper`使用）
- コスト効率が良い
- Twitter API（月$100〜）より安価
- メンテナンス不要

### 使用しているActor
- **xtdata/twitter-x-scraper**: モニタリング用途に対応したTwitterスクレイパー
- ユーザータイムラインの定期チェックが可能

## セットアップ手順

### 1. Apifyアカウント作成

1. [Apify](https://apify.com/)にアクセス
2. 無料アカウントを作成（クレジットカード不要で開始可能）
3. 無料プランでも月$5相当のクレジットが付与されます

### 2. APIトークンの取得

1. [Apify Console](https://console.apify.com/)にログイン
2. 右上のユーザーアイコン → **Settings** をクリック
3. 左メニューから **Integrations** を選択
4. **Personal API tokens** セクションで **Create API token** をクリック
5. トークン名を入力（例：「x-reminder-bot」）
6. 生成されたAPIトークンをコピー

### 3. .envファイルの更新

`.env` ファイルに以下を追加：

```bash
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. テスト実行

デバッグモードでテスト：

```bash
cd /home/contabo/work/settler_store_operation_system/scripts/x-reminder-bot
DEBUG_MODE=true DEBUG_TIME="2026-02-01T17:00:00+09:00" npm start
```

成功すると、以下のようなログが表示されます：

```
Fetching tweets for @634poker_kanda using Apify...
Date filter: 2026-02-01 to 2026-02-02
Received 15 tweets from Apify
Found 15 posts today
🐛 Post 1: [2026-02-01T16:17:00.000Z] ⚜️店内状況⚜️...
...
```

## コストについて

### 無料プラン
- 月$5相当のクレジット
- 約12,500ツイートの取得が可能

### 有料プラン（必要に応じて）
- Pay-as-you-go: $0.40/1,000ツイート
- 月100ツイート程度の監視なら無料プランで十分

### このbotの使用量
- 毎時チェック × 6回/日（17:00-22:00）× 平日5日 = 週30回
- 1回あたり100ツイート取得 = 週3,000ツイート
- 月約12,000ツイート = 月$4.80程度

**無料プランの範囲内で運用可能です！**

## トラブルシューティング

### API Token エラー

```
Error: APIFY_API_TOKEN environment variable is required
```

→ `.env` ファイルに `APIFY_API_TOKEN` が設定されているか確認

### API Rate Limit エラー

```
Apify API error: 429 Too Many Requests
```

→ リクエスト頻度を減らすか、有料プランにアップグレード

### 0件のツイートが返される

デバッグモードで確認：
```bash
DEBUG_MODE=true npm start
```

日付フィルターが正しく設定されているか確認してください。

## 実装の詳細

### Actor選定の経緯
1. **apidojo/tweet-scraper**: 最初に試したが、モニタリング用途が利用規約違反でrate limitに引っかかり使用不可
2. **xtdata/twitter-x-scraper**: ✅ モニタリング用途に対応しており、正常に動作

### 日付フィルタリング
- APIレベルでの日付フィルタはサポートされていないため、クライアント側で実施
- 最新100件を取得後、当日のツイートのみにフィルタリング

## 参考リンク

- [xtdata Twitter X Scraper](https://apify.com/xtdata/twitter-x-scraper)
- [Apify API Documentation](https://docs.apify.com/api/v2)
- [Run Actor and retrieve data via API](https://docs.apify.com/academy/api/run-actor-and-retrieve-data-via-api)
