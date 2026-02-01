# Order Monitor

choose-monster-app.com の新規注文を監視し、Discordに通知を送信するスクリプトです。

## 機能

- Puppeteerを使用したブラウザ自動操作によるログイン
- ページのDOM変更を監視して新規注文を検知
- Discord Webhookによる即座の通知
- セッション維持のための定期リロード
- 重複通知防止機能

## 前提条件

- Node.js 18以上
- npm または yarn

## セットアップ

### 1. 依存関係のインストール

```bash
cd scripts/order-monitor
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成し、各項目を設定してください。

```bash
cp .env.example .env
```

### 3. 環境変数の説明

| 変数名 | 必須 | 説明 | デフォルト値 |
|--------|------|------|--------------|
| `LOGIN_URL` | - | ログインページのURL | `https://choose-monster-app.com` |
| `LOGIN_EMAIL` | ✓ | ログイン用メールアドレス | - |
| `LOGIN_PASSWORD` | ✓ | ログイン用パスワード | - |
| `TARGET_URL` | - | 監視対象ページのURL（受注伝票ページ） | `https://choose-monster-app.com` |
| `DISCORD_WEBHOOK_URL` | - | Discord Webhook URL | - |
| `RELOAD_INTERVAL` | - | ページリロード間隔（ミリ秒） | `1800000`（30分） |
| `HEADLESS` | - | ヘッドレスモード（`true`/`false`） | `true` |

## 使用方法

### 起動

```bash
npm start
```

### デバッグモード（ブラウザ表示あり）

```bash
HEADLESS=false npm start
```

### 停止

`Ctrl+C` で停止できます。

## Discord Webhook の設定

1. Discordでサーバー設定を開く
2. 「連携サービス」→「ウェブフック」を選択
3. 「新しいウェブフック」を作成
4. 通知を送信したいチャンネルを選択
5. 「ウェブフックURLをコピー」をクリック
6. コピーしたURLを `.env` の `DISCORD_WEBHOOK_URL` に設定

## トラブルシューティング

### ログインに失敗する場合

1. `HEADLESS=false` でブラウザを表示して動作確認
2. `debug-login.png` が生成されていれば、ログインページの状態を確認
3. メールアドレス・パスワードが正しいか確認

### 通知が届かない場合

1. `DISCORD_WEBHOOK_URL` が正しく設定されているか確認
2. Discordのウェブフック設定でチャンネルが正しいか確認
3. ターミナルのログで `[Discord]` のメッセージを確認

### セッションが切れる場合

`RELOAD_INTERVAL` の値を小さくして、より頻繁にページをリロードするよう調整してください。

## ファイル構成

```
order-monitor/
├── index.js          # メインスクリプト
├── package.json      # 依存関係定義
├── .env.example      # 環境変数テンプレート
├── .env              # 環境変数（要作成）
└── .gitignore        # Git除外設定
```

## 注意事項

- `.env` ファイルには機密情報が含まれるため、Gitにコミットしないでください
- 本番環境では `HEADLESS=true` で運用してください
- サーバー上で常時稼働させる場合は、pm2やsystemdなどのプロセスマネージャーの使用を推奨します
