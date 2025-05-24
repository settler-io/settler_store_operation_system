import { addMinutes } from "date-fns";
import { createId, initialVersion } from "../common";
import type { Entity } from "../common/types";
import { EMAIL_VERIFICATION_TOKEN_SCHEMA } from "./schema";

interface Data {
  id: string;
  version: number;
  userId: string;
  email: string;
  expiresAt: Date;
}

export class EmailVerificationToken implements Entity {
  static schema = EMAIL_VERIFICATION_TOKEN_SCHEMA;
  readonly #data: Data;

  get id() {
    return this.#data.id;
  }

  get userId() {
    return this.#data.userId;
  }

  get email() {
    return this.#data.email;
  }

  get expiresAt() {
    return this.#data.expiresAt;
  }

  get version() {
    return this.#data.version;
  }

  constructor(data: Record<keyof Data, unknown>) {
    this.#data = {
      id: EmailVerificationToken.schema.id.parse(data.id),
      userId: EmailVerificationToken.schema.userId.parse(data.userId),
      email: EmailVerificationToken.schema.email.parse(data.email),
      expiresAt: EmailVerificationToken.schema.expiresAt.parse(data.expiresAt),
      version: EmailVerificationToken.schema.version.parse(data.version),
    };
  }

  /**
   * EmailVerificationTokenの新規作成の仕様
   *
   * 認証トークン（ID）は16桁のcuid
   * トークンの有効期限は30分まで
   */
  static create(data: { userId: string; email: string }, serverCurrentTime = new Date()) {
    return new EmailVerificationToken({
      ...data,
      id: createId(),
      expiresAt: addMinutes(serverCurrentTime, 30),
      version: initialVersion(),
    });
  }

  /**
   * 現在時刻に対して、トークンの有効期限が切れているどうかの判定
   */
  isExpired(now = new Date()): boolean {
    return this.#data.expiresAt < now;
  }

  /**
   * 現状は変更するユースケースがない
   */
  getChanges(): Data {
    throw new Error("NotImplemented");
  }
}
