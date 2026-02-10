# スマレジタイムカードBot

スマレジタイムカードAPIから従業員の日次給与データを取得し、Discordに投稿するボットです。

## 特徴

- 前日の従業員給与データを自動取得
- 従業員別の労働時間と給与額を表示
- 専用のDiscord Webhookに投稿（売上レポートとは分離）
- スマレジPlatform API認証に対応

## 前提条件

- Node.js 18以上
- スマレジアカウント（Platform API利用可能）
- Discord Webhook URL

## セットアップ

### 1. 依存関係のインストール

```bash
cd /home/contabo/work/settler_store_operation_system/scripts/smaregi-timecard-bot
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、必要な情報を設定します。

```bash
cp .env.example .env
```

```.env
# スマレジAPI設定
SMAREGI_CLIENT_ID=your_client_id
SMAREGI_CLIENT_SECRET=your_client_secret
SMAREGI_REDIRECT_URI=https://your-domain.com/callback
SMAREGI_USE_SANDBOX=false

# タイムカード専用Discord Webhook
TIMECARD_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxx/xxxx
DISCORD_BOT_NAME=スマレジタイムカードBot

# 店舗ID
STORE_ID=2
```

**重要**: 既存のsmaregi-discord-botと同じスマレジAPI認証情報を使用できます。

### 3. スマレジAPI認証

初回実行時は認証トークンが必要です。既存のsmaregi-discord-botで認証済みの場合は、トークンファイルをコピーできます。

```bash
# 既存のトークンをコピー（推奨）
cp ../smaregi-discord-bot/.smaregi-token.json ./.smaregi-token.json
```

または、新規に認証を行う場合は、既存botのsetup.tsを参考に認証を実施してください。

## 使用方法

### 開発実行（TypeScript直接実行）

```bash
npm run dev
```

店舗IDを指定する場合:

```bash
npm run dev -- --store=2
```

### 本番実行（ビルド後）

```bash
npm run build
npm run start -- --store=2
```

### 定期実行（cron）

`run-daily-report.sh` を使って定期実行できます。

```bash
# 手動実行テスト
./run-daily-report.sh
```

crontabに登録（毎朝9時に実行）:

```bash
crontab -e
```

```cron
0 9 * * * /home/contabo/work/settler_store_operation_system/scripts/smaregi-timecard-bot/run-daily-report.sh
```

## Discord通知フォーマット

```
💰 2026/02/03 給与レポート

👥 勤務従業員数: 5人
⏰ 総労働時間: 40時間30分 (2430分)
💵 総給与額: ¥45,000
📊 平均時給: ¥1,111/時間

【従業員別内訳】
・山田太郎 - 8時間0分 / ¥9,000
・佐藤花子 - 7時間30分 / ¥8,250
...

※ 給与額は概算値です
```

## ディレクトリ構造

```
smaregi-timecard-bot/
├── src/
│   ├── index.ts           # メインエントリポイント
│   ├── smaregi-auth.ts    # スマレジAPI認証
│   ├── timecard-client.ts # タイムカードAPIクライアント
│   ├── discord-webhook.ts # Discord通知
│   └── types.ts           # 型定義
├── dist/                  # ビルド出力
├── logs/                  # ログファイル
├── .env                   # 環境変数（git管理外）
├── .smaregi-token.json    # 認証トークン（git管理外）
├── package.json
├── tsconfig.json
├── run-daily-report.sh    # 日次実行スクリプト
└── README.md
```

## トラブルシューティング

### 認証エラーが発生する

- `.smaregi-token.json` が正しく配置されているか確認
- 既存のsmaregi-discord-botからトークンをコピー
- トークンの有効期限が切れている場合は再認証

### APIエラーが発生する

- 店舗IDが正しいか確認
- スマレジAPIのタイムカード機能が有効化されているか確認
- API制限に達していないか確認

### Discord通知が送信されない

- `TIMECARD_DISCORD_WEBHOOK_URL` が正しく設定されているか確認
- Webhook URLがアクティブか確認
- ネットワーク接続を確認

### データが取得できない

- 前日にタイムカードの打刻データが存在するか確認
- 該当店舗でタイムカード機能を使用しているか確認

## ログ

ログファイルは `logs/YYYY-MM-DD.log` に保存されます。

```bash
# 最新のログを確認
tail -f logs/$(date +%Y-%m-%d).log
```

## 開発

### ビルド

```bash
npm run build
```

### 型チェック

```bash
npx tsc --noEmit
```

## ライセンス

このプロジェクトは内部使用目的です。

## 関連プロジェクト

- [smaregi-discord-bot](../smaregi-discord-bot/) - 売上レポートBot
- [smaregi-accounting-bot](../smaregi-accounting-bot/) - 会計Bot

## サポート

問題が発生した場合は、ログファイルを確認するか、開発チームに連絡してください。
