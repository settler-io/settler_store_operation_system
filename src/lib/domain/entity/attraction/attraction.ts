import { createId, initialVersion, type Entity } from "../common";
import { ATTRACTION_SCHEMA } from "./schema";

interface Data {
  readonly id: string;
  version: number;
  userId: string;
  message: string;
  startAt: Date;
  endAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Attraction implements Entity {
  static schema = ATTRACTION_SCHEMA;

  readonly #data: Data;

  get id() {
    return this.#data.id;
  }

  get version() {
    return this.#data.version;
  }

  get userId() {
    return this.#data.userId;
  }

  get message() {
    return this.#data.message;
  }

  get startAt() {
    return this.#data.startAt;
  }

  get endAt() {
    return this.#data.endAt;
  }

  get updatedAt() {
    return this.#data.updatedAt;
  }

  static create(
    data: {
      userId: string;
      message: string;
      startAt: Date;
      endAt: Date;
    },
    serverCurrentTime = new Date(),
  ): Attraction {
    return new Attraction({
      id: createId(),
      version: initialVersion(),
      userId: data.userId,

      message: data.message,
      startAt: data.startAt,
      endAt: data.endAt,
      createdAt: serverCurrentTime,
      updatedAt: serverCurrentTime,
    });
  }

  constructor(data: Record<keyof Data, unknown>) {
    this.#data = {
      id: Attraction.schema.id.parse(data.id),
      userId: Attraction.schema.userId.parse(data.userId),
      version: Attraction.schema.version.parse(data.version),
      message: Attraction.schema.message.parse(data.message),
      startAt: Attraction.schema.startAt.parse(data.startAt),
      endAt: Attraction.schema.endAt.parse(data.endAt),
      createdAt: Attraction.schema.createdAt.parse(data.createdAt),
      updatedAt: Attraction.schema.updatedAt.parse(data.updatedAt),
    };
  }

  updateMessage(val: string) {
    this.#data.message = val;
  }

  updateStartAt(val: Date) {
    this.#data.startAt = val;
  }

  updateEndAt(val: Date) {
    this.#data.endAt = val;
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
