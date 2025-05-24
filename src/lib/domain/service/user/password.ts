/**
 * Userのパスワードに関する仕様
 */
export class PasswordService {
  readonly #secret: string;

  constructor(secret: string) {
    this.#secret = secret;
  }

  /**
   * 入力パスワードを保存して扱うハッシュ値に変換する処理
   * パスワードの暗号化の仕様
   */
  async hashPassword(password: string, salt: string): Promise<string> {
    return sha256(`${password}${salt}${this.#secret}`);
  }

  /**
   * ユーザのパスワード検証処理
   *
   * User.passwordはGoogle OAuthの場合はnullで設定されているため、nullを許容している
   */
  async verifyPassword(currentHashedPassword: string | null, password: string, salt: string): Promise<void> {
    if (currentHashedPassword === null) {
      throw new Error("User does not configure password");
    }

    if (!(currentHashedPassword === (await this.hashPassword(password, salt)))) {
      throw new Error("incorrect password");
    }
  }
}

/**
 * 一般的なsha256の実装
 */
async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  const hexString = Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hexString;
}
