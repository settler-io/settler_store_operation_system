# MUSAPO-KANDA Leaderboard

むさぽ神田のリーダーボードをGitHub Pagesで公開しています。

## デプロイ方法

1. GitHubリポジトリの Settings > Pages に移動
2. Source を "GitHub Actions" に設定
3. main ブランチにプッシュすると自動的にデプロイされます

## ローカルで実行

```bash
npm install
npm run dev
```

http://localhost:3000/mkleaderboard にアクセスしてください。

## ビルド

```bash
npm run build
```

静的ファイルは `out` ディレクトリに生成されます。

