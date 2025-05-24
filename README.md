# Gemucha

## ローカル環境構築手順

ローカル環境で開発ができるための初回の環境構築手順を記載します。

1. `git clone` する
2. `npm install` する
3. `docker compose` する
4. `prisma migrate` する
5. `npx playwright install` する

### 1. `git clone` する

[GitHub](https://github.com/settler-io/gemucha)からソースコードをローカル環境に clone してくる。
clone 後は作成したディレクトリに移動する。

```sh
git clone git@github.com:settler-io/gemucha.git
cd gemucha
```

### 2. `npm install` する

このアプリは Node.js を使って動かしているため、そのセットアップが必要。
以下コマンドで必要なモジュールをインストールしておく。
前提として、Node.js 自体のインストールが必要なので、事前に作業しておく。
Node.jsのバージョンはv20を使う。

```sh
npm install
```

### 3. `docker compose` する

このアプリをローカル環境で動かすために、MySQL サーバーが動いている必要がある。
MySQL サーバーは Docker で動かせるようにしてあるため、以下のコマンドを実行してセットアップする。

```sh
docker compose up -d
```

### 4. `prisma migrate` する

Docker で MySQL サーバーを立ち上げた後に、このアプリが必要とするテーブルとデータを準備する。
以下のコマンドを実行してセットアップする。

また MySQL サーバーと接続する設定は `.env` ファイルで管理しているため、事前にそちらを準備しておく必要がある。
以下のコマンドで `.env` ファイルを作成して、内容を各自の環境に合わせて編集する。

```sh
cp .env.sample .env
```

`.env` ファイルが準備できたら以下コマンドを実行する。

```sh
prisma db push
prisma db seed
```

以上でローカル環境が動くようになる。
この後は `npm run dev` コマンドを使ってローカル環境でアプリを動かせる。

### 5. `npx playwright install` する

E2Eテストをローカル環境で実行するために、playwrightの実行ファイルを用意しておく必要がある。
以下のコマンドでインストールしておく。

```sh
npx playwright install
```
