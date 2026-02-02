# Cookie認証の使い方

Twitterのbot検出を回避するため、Cookie認証を実装しました。

## なぜCookie認証が必要か？

Twitterは自動ログインを検出してブロックしています。そのため、以下の2つの方法でこの問題を回避できます：

1. **手動ログイン（推奨）**: ローカルマシンで手動ログインしてCookieを保存
2. **ブラウザからCookieをエクスポート**: 既存のログインセッションからCookieをコピー

## 方法1: 手動ログイン（ローカルマシンのみ）

ローカルマシンで以下のコマンドを実行してください：

```bash
npm run save-cookies
```

ブラウザが起動するので：
1. Twitterにログインする
2. ログイン完了後、ターミナルでEnterキーを押す
3. `twitter-cookies.json` ファイルが保存される

このファイルをサーバーにアップロードしてください。

## 方法2: ブラウザからCookieをエクスポート（サーバー用）

サーバーではブラウザが表示できないため、以下の手順でCookieを手動で取得してください：

### Chrome/Edgeの場合

1. Twitterにログインした状態で https://x.com/home を開く
2. F12キーで開発者ツールを開く
3. 「Application」タブ（日本語: アプリケーション）を選択
4. 左側の「Cookies」→「https://x.com」を選択
5. 全てのCookieを選択してコピー
6. 以下のフォーマットで `twitter-cookies.json` ファイルを作成：

```json
[
  {
    "name": "auth_token",
    "value": "...",
    "domain": ".x.com",
    "path": "/",
    "expires": 1234567890,
    "httpOnly": true,
    "secure": true,
    "sameSite": "None"
  },
  {
    "name": "ct0",
    "value": "...",
    "domain": ".x.com",
    "path": "/",
    "expires": 1234567890,
    "httpOnly": false,
    "secure": true,
    "sameSite": "Lax"
  }
]
```

### より簡単な方法: コンソールでエクスポート

1. Twitterにログインした状態で https://x.com/home を開く
2. F12キーで開発者ツールを開く
3. 「Console」タブを選択
4. 以下のコードを貼り付けて実行：

```javascript
copy(JSON.stringify(document.cookie.split('; ').map(c => {
  const [name, value] = c.split('=');
  return {
    name,
    value,
    domain: '.x.com',
    path: '/',
    expires: Date.now() / 1000 + 365 * 24 * 60 * 60,
    httpOnly: false,
    secure: true,
    sameSite: 'Lax'
  };
}), null, 2))
```

5. クリップボードにコピーされたJSONを `twitter-cookies.json` として保存

## Cookieファイルの配置

`twitter-cookies.json` ファイルを以下の場所に配置してください：

```
/home/contabo/work/settler_store_operation_system/scripts/x-reminder-bot/twitter-cookies.json
```

## 動作確認

Cookieが正しく設定されているか確認：

```bash
cd /home/contabo/work/settler_store_operation_system/scripts/x-reminder-bot
DEBUG_MODE=true npm start
```

ログに「Using saved cookies for authentication...」と表示され、ログインに成功すれば完了です。

## トラブルシューティング

### Cookieの有効期限切れ

Cookieには有効期限があります。ログインに失敗する場合は、新しいCookieを取得してください。

### Cookieが無効

以下の場合、Cookieが無効になることがあります：
- パスワードを変更した
- 別のデバイスからログアウトした
- Twitterがセキュリティ上の理由でセッションを無効化した

その場合は、再度Cookieを取得してください。
