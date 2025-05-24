const ALLOWED_HOST = ["localhost.com", "localhost", "app.gemucha.com", "dev-app.gemucha.com"] as const;
type AllowedHost = (typeof ALLOWED_HOST)[number];

/**
 * アプリケーションの設定値を管理するためのobject
 *
 * getterを使っているのは、環境変数の評価が必ず実行時に行われるようにするため
 * また、万が一、このobjectがclientのjsファイルに渡ってしまった際に、JSON.stringifyで値が流出しないようにするため
 */
export const config = {
  /**
   * アプリの動作サーバのhost名
   * hostは、localhost, app.gemucha.com, dev-app.gemucha.comの値だけが許容されている
   * hostの環境変数は、Dockerビルド時に埋め込み設定している
   */
  get host(): AllowedHost {
    const host = process.env["HOST"] ? process.env["HOST"] : "localhost";
    validateHost(host);
    return host as AllowedHost;
  },

  get isLocalhost() {
    return this.host === "localhost" || this.host === "localhost.com";
  },

  get isAwsDev() {
    return this.host === "dev-app.gemucha.com";
  },

  get isAwsProd() {
    return this.host === "app.gemucha.com";
  },

  /**
   * window.location.origin の形式の値
   * devであればhttps://dev-app.gemucha.com, localであればhttp://localhost:3000
   */
  get origin(): string {
    return this.isLocalhost ? "http://localhost:3000" : `https://${this.host}`;
  },

  get emailSenderAddress() {
    // Emailの送信元はdev環境と本番環境で異なる
    // ローカルパートはno-reply固定
    const localPart = "no-reply";
    return this.isAwsProd ? `${localPart}@torecaswap.com` : `${localPart}@dev.torecaswap.com`;
  },

  get masterPassword() {
    // MASTER_PASSWORDが設定されていないと空文字列でパスワードやJWTのハッシュ処理をしてしまうリスクがあるため、念の為エラーにしておく
    if (!process.env["MASTER_PASSWORD"]) {
      throw new Error("process.env.MASTER_PASSWORD not set");
    }

    return process.env["MASTER_PASSWORD"];
  },

  get userImageS3BucketName() {
    return this.isAwsProd ? "523724343874-gemucha-app-storage" : "496217581614-gemucha-app-storage";
  },

  /**
   * StripeのAPI認証用の公開情報
   * この値はクライアントに渡しても良い
   */
  get stripeApiKey() {
    return process.env["STRIPE_API_KEY"] ?? "";
  },

  /**
   * StripeのAPI認証用の秘密情報
   * この値はクライアントに渡してはいけない
   */
  get stripeApiSecret() {
    return process.env["STRIPE_API_SECRET"] ?? "";
  },

  get googleTagManagerId() {
    return this.isAwsProd ? "GTM-NW3Z8B49" : "GTM-PRZZ8W7P";
  },

  // AWSアカウントに関わらず固定値
  awsRegion: "ap-northeast-1",

  get appName() {
    return "トレカスワップ";
  },
} as const;

function validateHost(host: string) {
  if (!ALLOWED_HOST.includes(host as any)) {
    throw new Error(`Invalid host ${host}`);
  }
}
