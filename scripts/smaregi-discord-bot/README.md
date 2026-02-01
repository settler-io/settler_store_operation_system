# スマレジ日報Discord Bot

前日の取引履歴をスマレジプラットフォームAPIから取得し、商品ごとに集計してDiscordに投稿するボットです。

## 機能

- 前日の取引履歴を自動取得
- 商品別に数量・金額を集計（ネッティング）
- Discordに見やすいフォーマットで投稿
- 毎週月曜日は自動的に前週（月〜日）のサマリーも送信
- `--weekly`オプションで任意のタイミングで週次レポートを送信可能
- エラー発生時はDiscordにエラー通知
- リフレッシュトークンによる自動トークン更新

## 必要条件

- Node.js 18以上
- スマレジ・デベロッパーズでのアプリ登録
- Discord Webhook URL

## セットアップ

### 1. 依存関係のインストール

```bash
cd scripts/smaregi-discord-bot
npm install
```

### 2. 環境変数の設定

```bash
cp .env.sample .env
```

`.env`ファイルを編集して以下を設定：

```
SMAREGI_CLIENT_ID=xxx      # アプリのクライアントID
SMAREGI_CLIENT_SECRET=xxx  # アプリのクライアントシークレット
SMAREGI_REDIRECT_URI=http://localhost:3000/callback
DISCORD_WEBHOOK_URL=xxx    # Discord Webhook URL
```

### 3. スマレジ・デベロッパーズでアプリを登録

1. [スマレジ・デベロッパーズ](https://developers.smaregi.jp/) にアクセス
2. アカウント登録・ログイン
3. 「アプリの新規作成」をクリック
4. 以下を設定：
   - アプリ名: 任意（例: 日報Bot）
   - リダイレクトURI: `http://localhost:3000/callback`
   - スコープ: `pos.transactions:read` を有効化
5. 作成後、クライアントID・クライアントシークレットを`.env`に設定

### 4. Discord Webhookの作成

1. Discordサーバーの設定を開く
2. 「連携サービス」→「ウェブフック」
3. 「新しいウェブフック」を作成
4. 投稿先チャンネルを選択
5. 「ウェブフックURLをコピー」して`.env`に設定

### 5. 初回認証セットアップ（重要）

```bash
npm run setup
```

このコマンドを実行すると：
1. 認可URLが表示されます
2. ブラウザでURLを開き、スマレジにログインしてアプリを認可
3. リダイレクト後のURLに含まれる`code`パラメータの値を入力
4. トークンが`.smaregi-token.json`に保存されます

## 実行方法

### 手動実行（テスト）

```bash
# 開発モード（TypeScript直接実行）
npm run dev

# または本番ビルド後に実行
npm run build
npm run start
```

### コマンドラインオプション

```bash
# 店舗IDを指定して実行
npm run start -- --store=1

# 前週のサマリーも含めて送信（月曜日以外でも送信可能）
npm run start -- --weekly
npm run start -- -w              # 短縮形

# 店舗IDと週次レポートを組み合わせ
npm run start -- --store=2 --weekly
```

**オプション一覧:**
- `--store=<店舗ID>` または `-s <店舗ID>`: 特定の店舗のみのレポートを送信
- `--weekly` または `-w`: 前週（月〜日）のサマリーも送信

**注意:** 月曜日に実行すると、`--weekly`オプションなしでも自動的に前週のサマリーが送信されます。

### 定期実行（cron設定）

毎日朝9時に実行する例：

```bash
# crontab -e で編集
0 9 * * * cd /path/to/settler_store_operation_system/scripts/smaregi-discord-bot && /usr/bin/node dist/index.js >> /var/log/smaregi-bot.log 2>&1
```

### systemdタイマーでの設定（推奨）

#### 1. サービスファイルを作成

```bash
sudo nano /etc/systemd/system/smaregi-discord-bot.service
```

```ini
[Unit]
Description=Smaregi Discord Bot
After=network.target

[Service]
Type=oneshot
WorkingDirectory=/path/to/settler_store_operation_system/scripts/smaregi-discord-bot
ExecStart=/usr/bin/node dist/index.js
User=youruser
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

#### 2. タイマーファイルを作成

```bash
sudo nano /etc/systemd/system/smaregi-discord-bot.timer
```

```ini
[Unit]
Description=Run Smaregi Discord Bot daily

[Timer]
OnCalendar=*-*-* 09:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

#### 3. 有効化

```bash
sudo systemctl daemon-reload
sudo systemctl enable smaregi-discord-bot.timer
sudo systemctl start smaregi-discord-bot.timer

# 状態確認
sudo systemctl list-timers | grep smaregi
```

## Discord投稿例

```
📊 2024/01/25 売上レポート
━━━━━━━━━━━━━━━━━━━━━━
取引件数: 45件
総売上: ¥123,456
総販売数量: 89点

🛒 商品別売上
🥇 商品A
　数量: 15点 / 売上: ¥45,000
🥈 商品B
　数量: 12点 / 売上: ¥36,000
🥉 商品C
　数量: 10点 / 売上: ¥25,000
...
```

## ファイル構成

```
scripts/smaregi-discord-bot/
├── src/
│   ├── index.ts              # メインエントリーポイント
│   ├── setup.ts              # 初回認証セットアップ
│   ├── smaregi-auth.ts       # スマレジプラットフォームAPI認証
│   ├── smaregi-transactions.ts # 取引履歴取得・集計
│   └── discord-webhook.ts    # Discord送信
├── dist/                     # ビルド出力
├── package.json
├── tsconfig.json
├── .env                      # 環境変数（git管理外）
├── .env.sample               # 環境変数サンプル
├── .smaregi-token.json       # 認証トークン（git管理外）
└── README.md
```

## トラブルシューティング

### 「No token data available」エラー

初回セットアップが完了していません。`npm run setup`を実行してください。

### 「Failed to refresh token」エラー

リフレッシュトークンが無効になっています。`npm run setup`で再認証してください。

### API認証エラー

- クライアントID/シークレットが正しいか確認
- 必要なスコープが有効になっているか確認
- アプリが「公開」状態になっているか確認

### 取引データが取得できない

- 前日に取引があったか確認
- 認可したユーザーの店舗データにアクセス権があるか確認

### Discord送信エラー

- Webhook URLが正しいか確認
- Webhookが削除されていないか確認
- チャンネルの権限を確認

## ライセンス

MIT
