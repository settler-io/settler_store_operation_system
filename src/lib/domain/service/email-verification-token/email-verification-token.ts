import { EmailVerificationToken } from "../../entity";
import type { IEmailVerificationTokenRepository } from "../../repository";

/**
 * Email認証トークンの発行や検証の処理に関するロジック
 */
export class EmailVerificationTokenService {
  #emailVerificationTokenRepository: IEmailVerificationTokenRepository;

  constructor(emailVerificationTokenRepository: IEmailVerificationTokenRepository) {
    this.#emailVerificationTokenRepository = emailVerificationTokenRepository;
  }

  /**
   * 新規に認証トークンを発行する
   */
  async issueToken(params: { userId: string; email: string }): Promise<string> {
    const token = EmailVerificationToken.create(params);
    await this.#emailVerificationTokenRepository.add(token);
    // メールのリンクに添付するためのトークンID
    return token.id;
  }

  /**
   * トークンのIDを検証してトークン情報を返す処理
   */
  async verifyToken(tokenId: string): Promise<{ userId: string; verifiedEmail: string }> {
    const token = await this.#emailVerificationTokenRepository.find(tokenId);
    if (token.isExpired()) {
      throw new Error("Token expired");
    }

    return {
      userId: token.userId,
      verifiedEmail: token.email,
    };
  }

  /**
   * トークンは使われたら削除する
   * 削除はメールアドレス単位で全て
   */
  async flushAllTokens(email: string): Promise<void> {
    await this.#emailVerificationTokenRepository.deleteAllByEmail(email);
  }
}
