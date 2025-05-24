import { createId, initialVersion, type Entity } from "../common";
import { HOST_IMAGE_SCHEMA } from "./schema";

interface Data {
  readonly id: string;
  version: number;
  userId: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export class HostImage implements Entity {
  static schema = HOST_IMAGE_SCHEMA;

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

  get imageUrl() {
    return this.#data.imageUrl;
  }

  get updatedAt() {
    return this.#data.updatedAt;
  }

  static create(
    data: {
      userId: string;
      imageUrl: string;
    },
    serverCurrentTime = new Date(),
  ): HostImage {
    return new HostImage({
      id: createId(),
      version: initialVersion(),
      userId: data.userId,
      imageUrl: data.imageUrl,
      createdAt: serverCurrentTime,
      updatedAt: serverCurrentTime,
    });
  }

  constructor(data: Record<keyof Data, unknown>) {
    this.#data = {
      id: HostImage.schema.id.parse(data.id),
      version: HostImage.schema.version.parse(data.version),
      userId: HostImage.schema.userId.parse(data.userId),
      imageUrl: HostImage.schema.imageUrl.parse(data.imageUrl),
      createdAt: HostImage.schema.createdAt.parse(data.createdAt),
      updatedAt: HostImage.schema.updatedAt.parse(data.updatedAt),
    };
  }

  updateImageUrl(val: string) {
    this.#data.imageUrl = val;
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
