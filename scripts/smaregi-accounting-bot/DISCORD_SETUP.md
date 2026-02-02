# Discord Bot セットアップガイド

このガイドでは、Discord Botアプリケーション「会計くん」を作成し、設定する手順を説明します。

## 1. Discord Developer Portalでアプリケーションを作成

### 1.1 Discord Developer Portalにアクセス

1. https://discord.com/developers/applications にアクセス
2. Discordアカウントでログイン
3. 右上の「New Application」ボタンをクリック

### 1.2 アプリケーションを作成

1. アプリケーション名に「会計くん」と入力
2. 「Create」をクリック

## 2. Botを作成

### 2.1 Bot設定ページに移動

1. 左メニューから「Bot」を選択
2. 「Add Bot」ボタンをクリック
3. 確認ダイアログで「Yes, do it!」をクリック

### 2.2 Bot設定を変更

1. **USERNAME（ユーザー名）** を「会計くん」に変更
2. **MESSAGE CONTENT INTENT** を有効化（重要！）
   - 下にスクロールして「Privileged Gateway Intents」セクションを見つける
   - 「MESSAGE CONTENT INTENT」をONにする
3. 「Save Changes」をクリック

### 2.3 Botトークンを取得

1. 「TOKEN」セクションで「Reset Token」をクリック
2. 確認ダイアログで「Yes, do it!」をクリック
3. 表示されたトークンをコピーして安全な場所に保存
   - ⚠️ このトークンは二度と表示されません
   - ⚠️ トークンは秘密情報です。公開しないでください

## 3. OAuth2設定

### 3.1 BotをDiscordサーバーに招待

1. 左メニューから「OAuth2」→「URL Generator」を選択
2. **SCOPES**で「bot」を選択
3. **BOT PERMISSIONS**で以下を選択:
   - Read Messages/View Channels
   - Send Messages
   - Read Message History
4. 下部に生成されたURLをコピー
5. ブラウザで新しいタブを開き、URLにアクセス
6. Botを追加したいサーバーを選択
7. 「認証」をクリック

## 4. 環境変数を設定

`.env`ファイルに取得したBotトークンを設定します:

```bash
cd /home/contabo/work/settler_store_operation_system/scripts/smaregi-accounting-bot
nano .env
```

`DISCORD_BOT_TOKEN`の値を、先ほど取得したトークンに置き換えます:

```env
DISCORD_BOT_TOKEN=YOUR_ACTUAL_BOT_TOKEN_HERE
```

保存して終了（Ctrl+O、Enter、Ctrl+X）

## 5. Botをテスト

### 5.1 手動でBotを起動

```bash
cd /home/contabo/work/settler_store_operation_system/scripts/smaregi-accounting-bot
npm start
```

正常に起動すると、以下のようなメッセージが表示されます:

```
Discord Bot起動完了
スケジューラー起動完了（毎朝9時に実行）
Bot起動完了。常駐モードで実行中...
```

### 5.2 Discordでテスト

Discordサーバーで以下のメッセージを送信してテストします:

```
@会計くん 02-01 15000
```

Botが以下のように返信すれば成功です:

```
記録しました
発生日: 2026-02-01
金額: ¥15,000
```

### 5.3 Botを停止

Ctrl+Cで停止します。

## 6. systemdサービスとして起動（本番環境）

### 6.1 既存のcronジョブを削除

```bash
cd /home/contabo/work/settler_store_operation_system/scripts/smaregi-accounting-bot
./remove-cron.sh
```

### 6.2 systemdサービスをセットアップ

```bash
./setup-systemd.sh
```

### 6.3 サービスを起動

```bash
sudo systemctl start smaregi-accounting-bot
```

### 6.4 サービスの状態を確認

```bash
sudo systemctl status smaregi-accounting-bot
```

### 6.5 ログを確認

```bash
# systemdのログ
journalctl -u smaregi-accounting-bot -f

# または、アプリケーションログ
tail -f /home/contabo/work/settler_store_operation_system/scripts/smaregi-accounting-bot/logs/bot.log
```

## 7. 使い方

### メッセージフォーマット

Discordで「会計くん」にメンションして、以下のフォーマットでメッセージを送信します:

#### フォーマット1: 年月日を指定

```
@会計くん 2026-02-02 15600
```

- 発生日: 2026-02-02
- 金額: 15600円

#### フォーマット2: 月日のみ指定（年は自動補完）

```
@会計くん 02-02 15600
```

- 発生日: 2026-02-02（現在の年で自動補完）
- 金額: 15600円

### 自動記録

毎朝9時（JST）に、前日のスマレジ現金売上が自動的にGoogleスプレッドシートに記録されます。

## トラブルシューティング

### Botがオンラインにならない

1. トークンが正しいか確認
2. `MESSAGE CONTENT INTENT`が有効化されているか確認
3. ログを確認: `journalctl -u smaregi-accounting-bot -f`

### Botがメッセージに反応しない

1. Botがサーバーに参加しているか確認
2. 正しくメンション（@会計くん）しているか確認
3. メッセージフォーマットが正しいか確認

### サービスが起動しない

```bash
# サービスの状態を確認
sudo systemctl status smaregi-accounting-bot

# ログを確認
journalctl -u smaregi-accounting-bot -n 50

# 設定ファイルを確認
cat /etc/systemd/system/smaregi-accounting-bot.service
```

## 参考リンク

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord.js Guide](https://discordjs.guide/)
- [Discord Bot Permissions Calculator](https://discordapi.com/permissions.html)
