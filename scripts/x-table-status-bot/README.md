# X Table Status Bot

テーブルの使用状況を取得してXに自動投稿するボット

## 機能

- Google Apps ScriptのAPIからテーブル使用状況を取得
- 前回の状態と比較して、変更があった場合のみ投稿
- Waiting listページのスクリーンショットを添付
- 平日（月〜金）の16:00, 18:00, 19:00, 20:00, 21:00（JST）に自動実行
- 土日祝日の14:00, 16:00, 18:00, 20:00（JST）に自動実行
- 日本の祝日を自動判定

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、必要な情報を入力します。

```bash
cp .env.example .env
```

`.env`ファイルの内容：

```env
# Google Apps Script API URL
GAS_API_URL=https://script.google.com/macros/s/AKfycbx-nABr251TGffVr794iF8_ss7zrMv9VCl3AJfn49MXfk7QHF5ayIKw84LYJuu3RD9N/exec?sheet=waiting&range=A1:F30

# Twitter/X API v2 credentials
# Get these from https://developer.twitter.com/en/portal/dashboard
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

# Waiting list URL
WAITING_LIST_URL=https://634poker-kanda.com/waitinglist?utm_source=x&utm_medium=social&utm_campaign=permanent&utm_content=profile

# Discord webhook for error notifications (optional)
DISCORD_WEBHOOK_URL=

# Debug mode
DEBUG_MODE=false
```

### X API v2 認証情報の取得方法（新UI対応）

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にアクセス
2. 左メニューの「アプリ」をクリック
3. 既存のAppを選択（または新規作成）
4. App詳細ページで以下を取得：

#### OAuth 1.0 キーセクション
- 「表示する」ボタンをクリックして **コンシューマーキー** を表示・コピー
  → `.env`の`TWITTER_API_KEY`に設定
- 同じく **コンシューマーシークレット** を表示・コピー
  → `.env`の`TWITTER_API_SECRET`に設定

#### アクセストークンセクション
- 「生成する」ボタンをクリック
- 生成された **Access Token** をコピー
  → `.env`の`TWITTER_ACCESS_TOKEN`に設定
- 生成された **Access Token Secret** をコピー
  → `.env`の`TWITTER_ACCESS_TOKEN_SECRET`に設定

#### ⚠️ 重要な設定
- **App Permissions**が「Read and Write」になっていることを確認
  - なっていない場合は「ユーザー認証設定」→「セットアップ」から変更
  - 変更後は**アクセストークンを再生成**する必要があります

5. 取得した4つの認証情報を`.env`ファイルに設定

### 3. ビルド

TypeScriptをJavaScriptにコンパイルします。

```bash
npm run build
```

## 使い方

### スクリーンショットのみ（テスト用）

Xに投稿せず、スクリーンショットだけを撮影してローカルに保存します。

```bash
npm run screenshot
```

保存先: `screenshot-YYYY-MM-DDTHH-MM-SS.png`

### 開発モード（デバッグ）

デバッグモードでは、時間チェックをスキップして即座に実行されます。

```bash
npm run debug
```

### 本番環境で起動

```bash
npm start
```

または、開発モードで起動（TypeScriptを直接実行）：

```bash
npm run dev
```

### systemdでサービスとして登録

永続的に実行するために、systemdサービスとして登録することを推奨します。

`/etc/systemd/system/x-table-status-bot.service`を作成：

```ini
[Unit]
Description=X Table Status Bot
After=network.target

[Service]
Type=simple
User=contabo
WorkingDirectory=/home/contabo/work/settler_store_operation_system/scripts/x-table-status-bot
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

サービスを有効化して起動：

```bash
sudo systemctl daemon-reload
sudo systemctl enable x-table-status-bot
sudo systemctl start x-table-status-bot
```

サービスの状態確認：

```bash
sudo systemctl status x-table-status-bot
```

ログの確認：

```bash
sudo journalctl -u x-table-status-bot -f
```

## データフォーマット

### Google Apps Script API レスポンス

```json
{
  "1-1-1": ["0"],
  "1-3-3": ["1"],
  "2-5-5": ["0"],
  "5-10-10": ["0"],
  "": []
}
```

### 投稿フォーマット

```
♣️店内状況♣️
18:00時点

1-3-3→1テーブル

で進行中です🔥

リアルタイム卓状況 👉 https://x.gd/QygYb

ご来店お待ちしております！
```

## ログ

ログは`logs/`ディレクトリに日付ごとに保存されます。

```bash
tail -f logs/bot-2026-02-05.log
```

## トラブルシューティング

### Xログインに失敗する

1. `.cookies.json`を削除して再度ログイン
2. ログイン情報が正しいか確認
3. デバッグモードで実行してスクリーンショットを確認

### スクリーンショットが取得できない

1. Waiting list URLが正しいか確認
2. ネットワーク接続を確認
3. puppeteerの依存関係をインストール

```bash
npx puppeteer browsers install chrome
```

### 投稿されない

1. 前回の状態ファイル`.last-state.json`を削除して再実行
2. デバッグモードで実行して動作を確認
3. ログファイルでエラーを確認

## ライセンス

MIT
