import { createId, initialVersion, type Entity } from "../common";
import { RESERVATION_SCHEMA } from "./schema";

interface Data {
  readonly id: string;
  version: number;
  hostUserId: string;
  guestUserId: string;
  price: number;
  startAt: Date;
  endAt: Date;
  game: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Reservation implements Entity {
  static schema = RESERVATION_SCHEMA;

  readonly #data: Data;

  get id() {
    return this.#data.id;
  }

  get version() {
    return this.#data.version;
  }

  get hostUserId() {
    return this.#data.hostUserId;
  }

  get guestUserId() {
    return this.#data.guestUserId;
  }

  get price() {
    return this.#data.price;
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
      hostUserId: string;
      guestUserId: string;
      price: number;
      startAt: Date;
      endAt: Date;
      game: string;
    },
    serverCurrentTime = new Date(),
  ): Reservation {
    return new Reservation({
      id: createId(),
      version: initialVersion(),
      hostUserId: data.hostUserId,
      guestUserId: data.guestUserId,
      price: data.price,
      startAt: data.startAt,
      endAt: data.endAt,
      game: data.game,
      createdAt: serverCurrentTime,
      updatedAt: serverCurrentTime,
    });
  }

  constructor(data: Record<keyof Data, unknown>) {
    this.#data = {
      id: Reservation.schema.id.parse(data.id),
      version: Reservation.schema.version.parse(data.version),
      hostUserId: Reservation.schema.hostUserId.parse(data.hostUserId),
      guestUserId: Reservation.schema.guestUserId.parse(data.guestUserId),
      price: Reservation.schema.price.parse(data.price),
      game: Reservation.schema.game.parse(data.game),
      startAt: Reservation.schema.startAt.parse(data.startAt),
      endAt: Reservation.schema.endAt.parse(data.endAt),
      createdAt: Reservation.schema.createdAt.parse(data.createdAt),
      updatedAt: Reservation.schema.updatedAt.parse(data.updatedAt),
    };
  }

  updatePrice(val: number) {
    this.#data.price = val;
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
