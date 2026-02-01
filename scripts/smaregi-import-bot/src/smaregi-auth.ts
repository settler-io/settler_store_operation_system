/**
 * スマレジプラットフォームAPI認証モジュール
 * OAuth2.0 Authorization Code Grantを使用
 *
 * 初回: 認可URL → 認可コード → アクセストークン + リフレッシュトークン
 * 以降: リフレッシュトークンでアクセストークンを更新
 */

import * as fs from "fs";
import * as path from "path";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  contractId: string;
}

interface SmaregiAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tokenFilePath?: string;
  useSandbox?: boolean;
}

// 開発環境（サンドボックス）と本番環境でURLが異なる
const SANDBOX_AUTH_URL = "https://id.smaregi.dev/authorize";
const SANDBOX_TOKEN_URL = "https://id.smaregi.dev/authorize/token";
const PRODUCTION_AUTH_URL = "https://id.smaregi.jp/authorize";
const PRODUCTION_TOKEN_URL = "https://id.smaregi.jp/authorize/token";

export class SmaregiPlatformAuth {
  private config: SmaregiAuthConfig;
  private tokenData: TokenData | null = null;
  private tokenFilePath: string;
  private authUrl: string;
  private tokenUrl: string;

  constructor(config: SmaregiAuthConfig) {
    this.config = config;
    this.tokenFilePath =
      config.tokenFilePath ||
      path.join(process.cwd(), ".smaregi-token.json");

    // 環境に応じたURLを設定
    if (config.useSandbox) {
      this.authUrl = SANDBOX_AUTH_URL;
      this.tokenUrl = SANDBOX_TOKEN_URL;
      console.log("Using SANDBOX environment (smaregi.dev)");
    } else {
      this.authUrl = PRODUCTION_AUTH_URL;
      this.tokenUrl = PRODUCTION_TOKEN_URL;
      console.log("Using PRODUCTION environment (smaregi.jp)");
    }

    // 保存済みトークンを読み込み
    this.loadTokenFromFile();
  }

  /**
   * 認可URLを生成（初回セットアップ用）
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: "pos.transactions:read pos.products:read pos.customers:read offline_access",
      state: state || "smaregi-bot",
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  /**
   * 認可コードをアクセストークンに交換（初回セットアップ用）
   */
  async exchangeCodeForToken(code: string): Promise<TokenData> {
    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString("base64");

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: this.config.redirectUri,
    });

    const response = await fetch(this.tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to exchange code for token: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as TokenResponse;

    // JWTトークンから契約IDを抽出
    const contractId = this.extractContractIdFromJwt(data.access_token);

    this.tokenData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || "",
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      contractId: contractId,
    };

    // トークンをファイルに保存
    this.saveTokenToFile();

    return this.tokenData;
  }

  /**
   * アクセストークンを取得（必要に応じてリフレッシュ）
   */
  async getAccessToken(): Promise<string> {
    if (!this.tokenData) {
      throw new Error(
        "No token data available. Please run the setup command first to authorize the app."
      );
    }

    // 有効期限をチェック（5分前にリフレッシュ）
    const expiresAt = new Date(this.tokenData.expiresAt);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (fiveMinutesFromNow >= expiresAt) {
      await this.refreshAccessToken();
    }

    return this.tokenData.accessToken;
  }

  /**
   * リフレッシュトークンでアクセストークンを更新
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.tokenData?.refreshToken) {
      throw new Error("No refresh token available");
    }

    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString("base64");

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: this.tokenData.refreshToken,
    });

    const response = await fetch(this.tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to refresh token: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as TokenResponse;

    // JWTトークンから契約IDを抽出
    const contractId = this.extractContractIdFromJwt(data.access_token);

    this.tokenData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || "",
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      contractId: contractId,
    };

    // 更新されたトークンを保存
    this.saveTokenToFile();

    console.log("Access token refreshed successfully");
  }

  /**
   * 契約IDを取得
   */
  getContractId(): string {
    if (!this.tokenData?.contractId) {
      throw new Error("No contract ID available. Please authorize the app first.");
    }
    return this.tokenData.contractId;
  }

  /**
   * JWTトークンから契約IDを抽出
   * JWTのsubフィールドは "契約ID:ユーザーID" の形式
   */
  private extractContractIdFromJwt(token: string): string {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
      // subフィールドは "契約ID:ユーザーID" の形式
      const sub = payload.sub as string;
      if (sub && sub.includes(":")) {
        return sub.split(":")[0];
      }
      throw new Error("Contract ID not found in JWT");
    } catch (error) {
      console.warn("Failed to extract contract ID from JWT:", error);
      return "";
    }
  }

  /**
   * トークンをファイルに保存
   */
  private saveTokenToFile(): void {
    if (!this.tokenData) return;

    fs.writeFileSync(
      this.tokenFilePath,
      JSON.stringify(this.tokenData, null, 2),
      "utf-8"
    );
    console.log(`Token saved to ${this.tokenFilePath}`);
  }

  /**
   * トークンをファイルから読み込み
   */
  private loadTokenFromFile(): void {
    try {
      if (fs.existsSync(this.tokenFilePath)) {
        const content = fs.readFileSync(this.tokenFilePath, "utf-8");
        this.tokenData = JSON.parse(content) as TokenData;
        console.log("Token loaded from file");
      }
    } catch (error) {
      console.warn("Failed to load token from file:", error);
      this.tokenData = null;
    }
  }

  /**
   * 認証済みかどうかを確認
   */
  isAuthenticated(): boolean {
    return this.tokenData !== null && !!this.tokenData.accessToken;
  }
}

/**
 * 環境変数からSmaregiPlatformAuthインスタンスを作成
 */
export function createSmaregiAuthFromEnv(): SmaregiPlatformAuth {
  const clientId = process.env.SMAREGI_CLIENT_ID;
  const clientSecret = process.env.SMAREGI_CLIENT_SECRET;
  const redirectUri =
    process.env.SMAREGI_REDIRECT_URI || "http://localhost:3000/callback";
  // SMAREGI_USE_SANDBOX=true で開発環境を使用
  const useSandbox = process.env.SMAREGI_USE_SANDBOX === "true";

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing required environment variables: SMAREGI_CLIENT_ID, SMAREGI_CLIENT_SECRET"
    );
  }

  return new SmaregiPlatformAuth({
    clientId,
    clientSecret,
    redirectUri,
    useSandbox,
  });
}
