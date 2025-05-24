import { createId, initialVersion, type Entity } from "../common";
import { CHAT_SCHEMA } from "./schema";

interface Data {
  readonly id: string;
  version: number;
  sendUserId: string;
  receiveUserId: string;
  comment: string;
  sendAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Chat implements Entity {
  static schema = CHAT_SCHEMA;

  readonly #data: Data;

  get id() {
    return this.#data.id;
  }

  get version() {
    return this.#data.version;
  }

  get sendUserId() {
    return this.#data.sendUserId;
  }

  get receiveUserId() {
    return this.#data.receiveUserId;
  }

  get comment() {
    return this.#data.comment;
  }

  get sendAt() {
    return this.#data.sendAt;
  }

  get updatedAt() {
    return this.#data.updatedAt;
  }

  static create(
    data: {
      sendUserId: string;
      receiveUserId: string;
      comment: string;
    },
    serverCurrentTime = new Date(),
  ): Chat {
    return new Chat({
      id: createId(),
      version: initialVersion(),
      sendUserId: data.sendUserId,
      receiveUserId: data.receiveUserId,
      comment: data.comment,
      sendAt: serverCurrentTime,
      createdAt: serverCurrentTime,
      updatedAt: serverCurrentTime,
    });
  }

  constructor(data: Record<keyof Data, unknown>) {
    this.#data = {
      id: Chat.schema.id.parse(data.id),
      version: Chat.schema.version.parse(data.version),
      sendUserId: Chat.schema.sendUserId.parse(data.sendUserId),
      receiveUserId: Chat.schema.receiveUserId.parse(data.receiveUserId),
      sendAt: Chat.schema.sendAt.parse(data.sendAt),
      comment: Chat.schema.comment.parse(data.comment),
      createdAt: Chat.schema.createdAt.parse(data.createdAt),
      updatedAt: Chat.schema.updatedAt.parse(data.updatedAt),
    };
  }

  updateComment(val: string) {
    this.#data.comment = val;
  }

  /**
   * 仕様上、変更される値のみを返却
   */
  getChanges() {
    return {
      ...this.#data,
    };
  }

  /**
   * Repository.addのためのデータ出力
   * Repository.add以外で使わない
   */
  getData() {
    return { ...this.#data };
  }
}
