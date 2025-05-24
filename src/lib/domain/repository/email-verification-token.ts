import { EmailVerificationToken } from "../entity";

export interface IEmailVerificationTokenRepository {
  find(id: EmailVerificationToken["id"]): Promise<EmailVerificationToken>;

  add(entity: EmailVerificationToken): Promise<void>;

  deleteAllByEmail(email: string): Promise<void>;
}
