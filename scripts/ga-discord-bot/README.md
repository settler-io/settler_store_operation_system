# GA Discord Bot

Google Analytics 4 (GA4) の前日データを取得してDiscordに投稿するボットです。

## セットアップ

### 1. Google Cloud設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. Google Analytics Data API を有効化
3. サービスアカウントを作成し、JSONキーをダウンロード
4. GA4 プロパティでサービスアカウントに「閲覧者」権限を付与

### 2. 環境変数設定

```bash
cp .env.sample .env
```

`.env` ファイルを編集:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxxx/xxxxx
DISCORD_BOT_NAME=GA日報Bot
GA_PROPERTY_ID=123456789
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

- `GA_PROPERTY_ID`: GA4 プロパティID（GA4管理画面 > プロパティ設定で確認）
- `credentials.json`: サービスアカウントのJSONキーファイル

### 3. 依存関係インストール

```bash
npm install
```

### 4. ビルド

```bash
npm run build
```

## 実行

### 開発実行

```bash
npm run dev
```

### 本番実行

```bash
npm start
```

### シェルスクリプト実行

```bash
./run-daily-report.sh
```

## cron設定例

毎日朝9時に実行:

```cron
0 9 * * * /path/to/ga-discord-bot/run-daily-report.sh
```

## 出力されるレポート

- **日次メトリクス**: アクティブユーザー、新規ユーザー、セッション数、ページビュー、平均セッション時間、エンゲージメント率
- **人気ページ TOP10**: ページパス、ページタイトル、PV数、ユーザー数
- **トラフィックソース**: 参照元/メディア、セッション数、ユーザー数
- **デバイス別**: PC/モバイル/タブレットの内訳
