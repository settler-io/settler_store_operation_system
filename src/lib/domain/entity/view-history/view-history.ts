import { createId, initialVersion, type Entity } from "../common";
import { VIEW_HISTORY_SCHEMA } from "./schema";

interface Data {
  readonly id: string;
  version: number;
  viewUserId: string;
  viewedUserId: string;
  viewAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ViewHistory implements Entity {
  static schema = VIEW_HISTORY_SCHEMA;

  readonly #data: Data;

  get id() {
    return this.#data.id;
  }

  get version() {
    return this.#data.version;
  }

  get viewUserId() {
    return this.#data.viewUserId;
  }

  get viewedUserId() {
    return this.#data.viewedUserId;
  }

  get viewAt() {
    return this.#data.viewAt;
  }

  get updatedAt() {
    return this.#data.updatedAt;
  }

  static create(
    data: {
      viewUserId: string;
      viewedUserId: string;
      viewAt: Date;
    },
    serverCurrentTime = new Date(),
  ): ViewHistory {
    return new ViewHistory({
      id: createId(),
      version: initialVersion(),
      viewUserId: data.viewUserId,
      viewedUserId: data.viewedUserId,
      viewAt: data.viewAt,
      createdAt: serverCurrentTime,
      updatedAt: serverCurrentTime,
    });
  }

  constructor(data: Record<keyof Data, unknown>) {
    this.#data = {
      id: ViewHistory.schema.id.parse(data.id),
      version: ViewHistory.schema.version.parse(data.version),
      viewUserId: ViewHistory.schema.viewUserId.parse(data.viewUserId),
      viewedUserId: ViewHistory.schema.viewedUserId.parse(data.viewedUserId),
      viewAt: ViewHistory.schema.viewAt.parse(data.viewAt),
      createdAt: ViewHistory.schema.createdAt.parse(data.createdAt),
      updatedAt: ViewHistory.schema.updatedAt.parse(data.updatedAt),
    };
  }

  updateViewAt(val: Date) {
    this.#data.viewAt = val;
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
