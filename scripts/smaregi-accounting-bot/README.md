# スマレジ現金売上記録Bot（会計くん）

スマレジの現金売上データをGoogleスプレッドシートに記録するBotです。

## 機能

### 1. 自動記録（スケジューラー）
- 毎朝9時（JST）に前日のスマレジ現金売上を自動記録
- スマレジPlatform APIから取引データを取得
- 現金での支払いのみを抽出して合計

### 2. 手動記録（Discord連携）
- Discord上で「@会計くん」にメンションして手動でデータを記録
- サポートされるフォーマット:
  - `@会計くん 2026-02-02 15600` （年月日を指定）
  - `@会計くん 02-02 15600` （月日のみ、年は自動補完）

### 3. Googleスプレッドシート記録
- 以下の3列を記録:
  - **記録日時**: データを記録した日時（JST）
  - **発生日**: 売上が発生した日（YYYY-MM-DD）
  - **金額**: 現金売上の合計金額

## セットアップ

### 1. 依存関係のインストール

```bash
cd scripts/smaregi-accounting-bot
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の情報を設定してください：

```env
# スマレジプラットフォームAPI設定
SMAREGI_CLIENT_ID=your_client_id
SMAREGI_CLIENT_SECRET=your_client_secret
SMAREGI_REDIRECT_URI=https://your-domain.com/callback
SMAREGI_USE_SANDBOX=false

# OAuth トークン保存先
SMAREGI_TOKEN_FILE=./.smaregi-token.json

# 店舗ID（オプション：特定店舗のみ対象とする場合）
STORE_ID=2

# Google スプレッドシート設定
GOOGLE_SPREADSHEET_ID=1Ep-tY_kUiII2_qTYwSOlCZa8PL37vPQ7WBn8CJ1-0kY
GOOGLE_SHEET_NAME=シート1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Discord Bot設定
DISCORD_BOT_TOKEN=your_discord_bot_token_here
```

### 3. スマレジAPI認証

スマレジAPIの認証トークンは、既に`smaregi-import-bot`で取得済みの場合、そのトークンファイルを使用できます。

新規に認証が必要な場合は、`smaregi-import-bot`のREADMEを参照してOAuth認証を行ってください。

### 4. Googleスプレッドシートの準備

#### スプレッドシートの作成

指定のスプレッドシート（ID: `1Ep-tY_kUiII2_qTYwSOlCZa8PL37vPQ7WBn8CJ1-0kY`）に、以下のヘッダー行を追加してください：

| 記録日時 | 発生日 | 金額 |
|---------|--------|------|

#### サービスアカウントの権限設定

1. Google Cloud Consoleでサービスアカウントのメールアドレスを確認
2. スプレッドシートの共有設定で、サービスアカウントに「編集者」権限を付与

### 5. Discord Botの設定

Discord Bot「会計くん」を作成して設定します。詳細な手順は [DISCORD_SETUP.md](DISCORD_SETUP.md) を参照してください。

**簡単な手順:**
1. https://discord.com/developers/applications で新しいアプリケーションを作成
2. Botを追加して「MESSAGE CONTENT INTENT」を有効化
3. Botトークンを取得して`.env`の`DISCORD_BOT_TOKEN`に設定
4. BotをDiscordサーバーに招待

### 6. ビルド

```bash
npm run build
```

### 7. 動作テスト

systemdサービスをセットアップする前に、手動で実行して動作を確認してください：

```bash
npm start
```

正常に起動すると、以下のようなメッセージが表示されます：

```
Discord Botモードが有効です
Discord Bot起動完了
スケジューラー起動完了（毎朝9時に実行）
Bot起動完了。常駐モードで実行中...
```

Discordで以下のメッセージを送信してテスト：

```
@会計くん 02-01 15000
```

### 8. systemdサービスのセットアップ（本番環境）

#### 既存のcronジョブを削除

```bash
./remove-cron.sh
```

#### systemdサービスを登録

```bash
./setup-systemd.sh
```

#### サービスを起動

```bash
sudo systemctl start smaregi-accounting-bot
```

#### サービスの状態を確認

```bash
sudo systemctl status smaregi-accounting-bot
```

## 使い方

### Discord経由での手動記録

Discordで「@会計くん」にメンションして、以下のフォーマットでメッセージを送信：

#### フォーマット1: 年月日を指定
```
@会計くん 2026-02-02 15600
```

#### フォーマット2: 月日のみ指定（年は自動補完）
```
@会計くん 02-02 15600
```

Botが以下のように返信します：

```
記録しました
発生日: 2026-02-02
金額: ¥15,600
```

### 自動記録（スケジューラー）

毎朝9時（JST）に前日の現金売上が自動的にGoogleスプレッドシートに記録されます。

### ログの確認

#### systemdのログ
```bash
journalctl -u smaregi-accounting-bot -f
```

#### アプリケーションログ
```bash
tail -f logs/bot.log
```

## サービス管理

### サービスの起動
```bash
sudo systemctl start smaregi-accounting-bot
```

### サービスの停止
```bash
sudo systemctl stop smaregi-accounting-bot
```

### サービスの再起動
```bash
sudo systemctl restart smaregi-accounting-bot
```

### サービスの状態確認
```bash
sudo systemctl status smaregi-accounting-bot
```

### 自動起動の有効化
```bash
sudo systemctl enable smaregi-accounting-bot
```

### 自動起動の無効化
```bash
sudo systemctl disable smaregi-accounting-bot
```

## トラブルシューティング

### スマレジAPIエラー

- トークンの有効期限が切れている場合、リフレッシュトークンで自動的に更新されます
- 認証エラーが発生する場合は、`.smaregi-token.json`を削除して再認証してください

### Googleスプレッドシートエラー

- サービスアカウントに適切な権限が付与されているか確認してください
- スプレッドシートIDとシート名が正しいか確認してください

### Discord Botエラー

- Botがオンラインにならない:
  - トークンが正しいか確認
  - `MESSAGE CONTENT INTENT`が有効化されているか確認
  - ログを確認: `journalctl -u smaregi-accounting-bot -f`

- Botがメッセージに反応しない:
  - Botがサーバーに参加しているか確認
  - 正しくメンション（@会計くん）しているか確認
  - メッセージフォーマットが正しいか確認

### systemdサービスエラー

```bash
# サービスの状態を確認
sudo systemctl status smaregi-accounting-bot

# ログを確認
journalctl -u smaregi-accounting-bot -n 50

# 設定ファイルを確認
cat /etc/systemd/system/smaregi-accounting-bot.service
```

## ディレクトリ構造

```
smaregi-accounting-bot/
├── src/
│   ├── index.ts              # メイン処理（スケジューラー＋Discord Bot）
│   ├── smaregi-auth.ts       # スマレジAPI認証
│   ├── smaregi-client.ts     # スマレジAPIクライアント
│   ├── spreadsheet-client.ts # Googleスプレッドシートクライアント
│   ├── discord-bot.ts        # Discord Botクライアント
│   └── message-parser.ts     # Discordメッセージパーサー
├── dist/                     # ビルド成果物
├── logs/                     # ログファイル
├── .env                      # 環境変数
├── .env.example              # 環境変数テンプレート
├── .gitignore
├── package.json
├── tsconfig.json
├── smaregi-accounting-bot.service  # systemdサービスファイル
├── setup-systemd.sh          # systemdサービス設定スクリプト
├── remove-cron.sh            # cronジョブ削除スクリプト
├── README.md                 # このファイル
└── DISCORD_SETUP.md          # Discord Bot詳細セットアップガイド
```

## ライセンス

ISC
