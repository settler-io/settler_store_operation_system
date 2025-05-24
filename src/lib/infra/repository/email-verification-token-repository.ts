import { EmailVerificationToken } from "@/domain/entity";
import type { IEmailVerificationTokenRepository } from "@/domain/repository";
import type { TransactionRunnerDatabaseClient } from "../types";
import { throwIfNotFound } from "./common";

/**
 * EmailVerificationTokenに関するデータ操作処理をまとめたclass
 */
export class EmailVerificationTokenRepository implements IEmailVerificationTokenRepository {
  readonly #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async find(id: string): Promise<EmailVerificationToken> {
    return await this.#client.emailVerificationToken
      .findUnique({
        where: {
          id,
        },
      })
      .then(throwIfNotFound)
      .then((data) => new EmailVerificationToken(data));
  }

  async add(data: EmailVerificationToken): Promise<void> {
    await this.#client.emailVerificationToken.create({
      data: {
        id: data.id,
        userId: data.userId,
        email: data.email,
        expiresAt: data.expiresAt,
        version: data.version,
      },
    });
  }

  async deleteAllByEmail(email: string): Promise<void> {
    await this.#client.emailVerificationToken.deleteMany({
      where: {
        email: email,
      },
    });
  }
}
