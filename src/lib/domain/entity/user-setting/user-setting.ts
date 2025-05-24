import { createId, initialVersion, type Entity } from "../common";
import { USER_SETTING_SCHEMA } from "./schema";

interface Data {
  readonly id: string;
  version: number;
  userId: string;
  price: number;
  withFace: boolean;
  imageUrl: string | null;
  profile: string | null;
  discordId: string | null;
  isHost: boolean;
  hostAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserSetting implements Entity {
  static schema = USER_SETTING_SCHEMA;

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

  get price() {
    return this.#data.price;
  }
  get withFace() {
    return this.#data.withFace;
  }
  get imageUrl() {
    return this.#data.imageUrl;
  }
  get profile() {
    return this.#data.profile;
  }
  get discordId() {
    return this.#data.discordId;
  }

  get isHost() {
    return this.#data.isHost;
  }

  get hostAt() {
    return this.#data.hostAt;
  }

  get updatedAt() {
    return this.#data.updatedAt;
  }

  static create(
    data: {
      userId: string;
      price: number;
      withFace: boolean;
      imageUrl: string | null;
      profile: string | null;
      discordId: string | null;
      isHost: boolean;
      hostAt: Date | null;
    },
    serverCurrentTime = new Date(),
  ): UserSetting {
    return new UserSetting({
      id: createId(),
      version: initialVersion(),
      userId: data.userId,
      price: data.price,
      withFace: !!data.withFace,
      imageUrl: data.imageUrl,
      profile: data.profile,
      discordId: data.discordId,
      isHost: data.isHost,
      hostAt: data.hostAt,
      createdAt: serverCurrentTime,
      updatedAt: serverCurrentTime,
    });
  }

  constructor(data: Record<keyof Data, unknown>) {
    this.#data = {
      id: UserSetting.schema.id.parse(data.id),
      userId: UserSetting.schema.userId.parse(data.userId),
      version: UserSetting.schema.version.parse(data.version),
      price: UserSetting.schema.price.parse(data.price),
      withFace: UserSetting.schema.withFace.parse(data.withFace),
      imageUrl: UserSetting.schema.imageUrl.nullable().parse(data.imageUrl),
      discordId: UserSetting.schema.discordId.nullable().parse(data.discordId),
      profile: UserSetting.schema.profile.nullable().parse(data.profile),
      isHost: UserSetting.schema.isHost.parse(data.isHost),
      hostAt: UserSetting.schema.hostAt.nullable().parse(data.hostAt),
      createdAt: UserSetting.schema.createdAt.parse(data.createdAt),
      updatedAt: UserSetting.schema.updatedAt.parse(data.updatedAt),
    };
  }

  updatePrice(price: number) {
    this.#data.price = price;
  }

  updateWithFace(val: boolean) {
    this.#data.withFace = val;
  }

  updateImageUrl(val: string | null) {
    this.#data.imageUrl = val;
  }

  updateDiscordId(val: string) {
    this.#data.discordId = val;
  }

  updateProfile(val: string) {
    this.#data.profile = val;
  }

  updateIsHost(val: boolean) {
    this.#data.isHost = val;
  }

  updateHostAt(val: Date) {
    this.#data.hostAt = val;
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
