import { createId, initialVersion, type Entity } from "../common";
import { GAMES, GAME_IMG, USER_GAME_SCHEMA } from "./schema";

interface Data {
  readonly id: string;
  version: number;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserGame implements Entity {
  static schema = USER_GAME_SCHEMA;
  static gameImg = GAME_IMG;
  static games = GAMES;

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

  get name() {
    return this.#data.name;
  }

  get updatedAt() {
    return this.#data.updatedAt;
  }

  static create(
    data: {
      userId: string;
      name: string;
    },
    serverCurrentTime = new Date(),
  ): UserGame {
    return new UserGame({
      id: createId(),
      version: initialVersion(),
      userId: data.userId,
      name: data.name,
      createdAt: serverCurrentTime,
      updatedAt: serverCurrentTime,
    });
  }

  constructor(data: Record<keyof Data, unknown>) {
    this.#data = {
      id: UserGame.schema.id.parse(data.id),
      version: UserGame.schema.version.parse(data.version),
      userId: UserGame.schema.userId.parse(data.userId),
      name: UserGame.schema.name.parse(data.name),
      createdAt: UserGame.schema.createdAt.parse(data.createdAt),
      updatedAt: UserGame.schema.updatedAt.parse(data.updatedAt),
    };
  }

  updateName(val: string) {
    this.#data.name = val;
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
