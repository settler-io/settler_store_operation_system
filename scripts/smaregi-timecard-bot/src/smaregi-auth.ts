/**
 * スマレジプラットフォームAPI認証モジュール
 * OAuth2.0 Client Credentials Grantを使用（自動認証、ユーザー操作不要）
 *
 * 毎回または有効期限切れ時に自動でアクセストークンを取得
 */

import * as fs from "fs";
import * as path from "path";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface TokenData {
  accessToken: string;
  expiresAt: string;
  contractId: string;
}

interface SmaregiAuthConfig {
  clientId: string;
  clientSecret: string;
  contractId: string;
  scopes?: string[];
  tokenFilePath?: string;
  useSandbox?: boolean;
}

// 開発環境（サンドボックス）と本番環境でURLが異なる
// Client Credentials Grantのエンドポイント: /app/{CONTRACT_ID}/token
const SANDBOX_TOKEN_BASE = "https://id.smaregi.dev/app";
const PRODUCTION_TOKEN_BASE = "https://id.smaregi.jp/app";

const DEFAULT_SCOPES = [
  "pos.transactions:read",
  "pos.products:read",
  "pos.customers:read",
  "timecard.shifts:read",
];

export class SmaregiPlatformAuth {
  private config: SmaregiAuthConfig;
  private tokenData: TokenData | null = null;
  private tokenFilePath: string;
  private tokenBaseUrl: string;

  constructor(config: SmaregiAuthConfig) {
    this.config = config;
    this.tokenFilePath =
      config.tokenFilePath ||
      path.join(process.cwd(), ".smaregi-token.json");

    // 環境に応じたURLを設定
    if (config.useSandbox) {
      this.tokenBaseUrl = SANDBOX_TOKEN_BASE;
      console.log("Using SANDBOX environment (smaregi.dev)");
    } else {
      this.tokenBaseUrl = PRODUCTION_TOKEN_BASE;
      console.log("Using PRODUCTION environment (smaregi.jp)");
    }

    // 保存済みトークンを読み込み（キャッシュ用）
    this.loadTokenFromFile();
  }

  /**
   * トークンエンドポイントURLを取得
   */
  private getTokenUrl(): string {
    return `${this.tokenBaseUrl}/${this.config.contractId}/token`;
  }

  /**
   * アクセストークンを取得（必要に応じて自動取得）
   */
  async getAccessToken(): Promise<string> {
    // 有効なトークンがあればそれを返す
    if (this.tokenData) {
      const expiresAt = new Date(this.tokenData.expiresAt);
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      if (fiveMinutesFromNow < expiresAt) {
        return this.tokenData.accessToken;
      }
    }

    // トークンがない or 期限切れなら新規取得
    await this.fetchAccessToken();
    return this.tokenData!.accessToken;
  }

  /**
   * Client Credentials Grantでアクセストークンを取得
   */
  private async fetchAccessToken(): Promise<void> {
    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString("base64");

    const scopes = this.config.scopes || DEFAULT_SCOPES;
    const params = new URLSearchParams({
      grant_type: "client_credentials",
      scope: scopes.join(" "),
    });

    const tokenUrl = this.getTokenUrl();
    console.log(`Fetching access token from ${tokenUrl}`);

    const response = await fetch(tokenUrl, {
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
        `Failed to fetch access token: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as TokenResponse;

    this.tokenData = {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      contractId: this.config.contractId,
    };

    // トークンをファイルにキャッシュ
    this.saveTokenToFile();

    console.log("Access token fetched successfully");
  }

  /**
   * 契約IDを取得
   */
  getContractId(): string {
    return this.config.contractId;
  }

  /**
   * トークンをファイルに保存（キャッシュ用）
   */
  private saveTokenToFile(): void {
    if (!this.tokenData) return;

    fs.writeFileSync(
      this.tokenFilePath,
      JSON.stringify(this.tokenData, null, 2),
      "utf-8"
    );
    console.log(`Token cached to ${this.tokenFilePath}`);
  }

  /**
   * トークンをファイルから読み込み
   */
  private loadTokenFromFile(): void {
    try {
      if (fs.existsSync(this.tokenFilePath)) {
        const content = fs.readFileSync(this.tokenFilePath, "utf-8");
        this.tokenData = JSON.parse(content) as TokenData;
        console.log("Token loaded from cache");
      }
    } catch (error) {
      console.warn("Failed to load token from cache:", error);
      this.tokenData = null;
    }
  }

  /**
   * 認証済みかどうかを確認（常にtrue、自動認証のため）
   */
  isAuthenticated(): boolean {
    return true;
  }
}

/**
 * 環境変数からSmaregiPlatformAuthインスタンスを作成
 */
export function createSmaregiAuthFromEnv(): SmaregiPlatformAuth {
  const clientId = process.env.SMAREGI_CLIENT_ID;
  const clientSecret = process.env.SMAREGI_CLIENT_SECRET;
  const contractId = process.env.SMAREGI_CONTRACT_ID;
  // SMAREGI_USE_SANDBOX=true で開発環境を使用
  const useSandbox = process.env.SMAREGI_USE_SANDBOX === "true";

  if (!clientId || !clientSecret || !contractId) {
    throw new Error(
      "Missing required environment variables: SMAREGI_CLIENT_ID, SMAREGI_CLIENT_SECRET, SMAREGI_CONTRACT_ID"
    );
  }

  return new SmaregiPlatformAuth({
    clientId,
    clientSecret,
    contractId,
    useSandbox,
  });
}
