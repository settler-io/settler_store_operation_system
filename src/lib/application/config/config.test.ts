import { config } from "./config";

describe("config", () => {
  test("host and computed values", () => {
    // hostのデフォルト値はlocalhost
    vi.stubEnv("HOST", "");
    expect(config.host).toBe("localhost");
    expect(config.isLocalhost).toBe(true);
    expect(config.origin).toBe("http://localhost:3000");
    expect(config.emailSenderAddress).toBe("no-reply@dev.torecaswap.com");
    // 許可されたhost以外はエラーになる
    vi.stubEnv("HOST", "bad.hostname.com");
    expect(() => config.host).toThrow();
    // 許可されたhostの場合はOK
    vi.stubEnv("HOST", "dev-app.gemucha.com");
    expect(config.host).toBe("dev-app.gemucha.com");
    expect(config.isLocalhost).toBe(false);
    expect(config.origin).toBe("https://dev-app.gemucha.com");
    expect(config.emailSenderAddress).toBe("no-reply@dev.torecaswap.com");
    // hostの値によっていくつかの設定値が切り替わる
    vi.stubEnv("HOST", "dev-app.gemucha.com");
    expect(config.isLocalhost).toBe(false);
    expect(config.isAwsDev).toBe(true);
    expect(config.isAwsProd).toBe(false);
    expect(config.userImageS3BucketName).toBe("496217581614-gemucha-app-storage");
    vi.stubEnv("HOST", "app.gemucha.com");
    expect(config.isLocalhost).toBe(false);
    expect(config.isAwsDev).toBe(false);
    expect(config.isAwsProd).toBe(true);
    expect(config.userImageS3BucketName).toBe("523724343874-gemucha-app-storage");
  });

  test("masterPassword", () => {
    // 未設定だとエラーになる
    // これは設定ミスでパスワードの暗号化処理が間違った結果にならないことを防ぐための対策
    vi.stubEnv("MASTER_PASSWORD", "");
    expect(() => config.masterPassword).toThrow();
    // 環境変数があればそれを還す
    vi.stubEnv("MASTER_PASSWORD", "password");
    expect(config.masterPassword).toBe("password");
  });

  test("stripeApiKey and stripeApiSecret", () => {
    // 初期値は空文字
    vi.stubEnv("STRIPE_API_KEY", "");
    vi.stubEnv("STRIPE_API_SECRET", "");
    expect(config.stripeApiKey).toBe("");
    expect(config.stripeApiSecret).toBe("");
    // envがあればそれを返す
    vi.stubEnv("STRIPE_API_KEY", "key");
    vi.stubEnv("STRIPE_API_SECRET", "secret");
    expect(config.stripeApiKey).toBe("key");
    expect(config.stripeApiSecret).toBe("secret");
  });
});
