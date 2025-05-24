import { throwApplicationError } from "@/domain/error";
import { createId, initialVersion, type Entity } from "../common";
import { DEFAULT_USER_IMAGE, USER_SCHEMA, USER_STATUS, type UserStatus } from "./schema";

interface Data {
  id: string;
  email: string | null;
  password: string | null;
  imageUrl: string | null;
  nickname: string | null;
  pointBalance: number;
  status: UserStatus;
  version: number;
}

export class User implements Entity {
  static schema = USER_SCHEMA;
  static statuses = USER_STATUS;
  static defaultImageUrl = DEFAULT_USER_IMAGE;
  // isSupplier=falseの場合は、合計カードサイズが1000まで保有できる
  static maxTotalTorecaSize = 1000;

  readonly #data: Data;

  get id() {
    return this.#data.id;
  }

  get version() {
    return this.#data.version;
  }

  get email() {
    return this.#data.email ?? "";
  }

  get password() {
    return this.#data.password;
  }

  get passwordSalt() {
    // saltはユーザごとに異なるランダムな文字列であれば何でも良い
    // トレカスワップでは実装を簡素にするためidを利用している
    return this.#data.id;
  }

  get nickname() {
    return this.#data.nickname ?? "";
  }

  get imageUrl() {
    return this.#data.imageUrl;
  }

  get pointBalance() {
    return this.#data.pointBalance;
  }

  /**
   * 登録ユーザがEmailを認証しているかどうか
   * Emailを認証していない場合はログインができない
   */
  get canLogin(): boolean {
    return this.#data.status !== User.statuses.emailRegistered;
  }

  /**
   * Email認証が完了していない場合は、基本機能全てが利用できない
   */
  get isEmailVerified(): boolean {
    switch (this.#data.status) {
      case User.statuses.emailRegistered:
      case User.statuses.emailUnverified: {
        return false;
      }
      default: {
        return true;
      }
    }
  }

  /**
   * 初回情報登録が完了していない場合は、基本機能全てが利用できない
   */
  get isRegistrationCompleted(): boolean {
    switch (this.#data.status) {
      case User.statuses.emailRegistered:
      case User.statuses.emailUnverified:
      case User.statuses.emailVerified: {
        return false;
      }
      default: {
        return true;
      }
    }
  }

  get status() {
    return this.#data.status;
  }

  constructor(data: Record<keyof Data, unknown>) {
    this.#data = {
      id: User.schema.id.parse(data.id),
      email: User.schema.email.nullable().parse(data.email),
      password: User.schema.password.nullable().parse(data.password),
      imageUrl: User.schema.imageUrl.nullable().parse(data.imageUrl),
      nickname: User.schema.nickname.nullable().parse(data.nickname),
      pointBalance: User.schema.pointBalance.parse(data.pointBalance),
      version: User.schema.version.parse(data.version),
      status: User.schema.status.parse(data.status),
    };
  }

  /**
   * Email登録で作成されるときの仕様
   * TODO: OAuthで作成されるときもこの処理を使うようにする
   *
   * @param data
   */
  static create(data: { email: string }) {
    return new User({
      ...data,
      id: createId(),
      password: null,
      imageUrl: null,
      nickname: null,
      pointBalance: 0,
      version: initialVersion(),
      status: User.statuses.emailRegistered,
    });
  }

  /**
   * 会員登録後にEmail認証した際の処理
   */
  updateStatusToEmailVerified(): void {
    if (!(this.status === User.statuses.emailRegistered || this.status === User.statuses.emailUnverified)) {
      throwApplicationError("InvalidUserStatus");
    }
    this.#data.status = User.statuses.emailVerified;
  }

  /**
   * 会員登録後にEmail認証した際の処理
   */
  updateStatusToPrivateInformationRegistered(): void {
    if (this.status !== User.statuses.emailVerified) {
      throwApplicationError("InvalidUserStatus");
    }
    this.#data.status = User.statuses.privateInformationRegistered;
  }

  /**
   * 会員登録後の初回情報登録の処理
   * 仕様として初回登録時は全項目をまとめて一度に登録する
   * その後の変更は、項目ごとに個別に行える
   */
  registerInitialInformation(data: { nickname: string }) {
    this.updateStatusToPrivateInformationRegistered();
    this.#data.nickname = User.schema.nickname.parse(data.nickname);
  }

  /**
   * マイページからEmail変更して、メール内リンクから認証する際の処理
   */
  updateEmail(email: string): void {
    this.#data.email = User.schema.email.parse(email);
  }

  /**
   * マイページからパスワード変更する際の処理
   *
   * パスワードのハッシュ処理はこの処理に含めていない
   * Userの責務でなく、PasswordServiceの責務として外部で扱う
   * ここではただパスワードの値を更新するだけにとどめている
   */
  updatePassword(newPassword: string): void {
    this.#data.password = User.schema.password.parse(newPassword);
  }

  /**
   * マイページからプロフィール画像を変更する際の処理
   */
  updateImageUrl(newValue: string): void {
    this.#data.imageUrl = User.schema.imageUrl.parse(newValue);
  }

  /**
   * 公開プロフィールの名前と紹介文の変更
   */
  updateProfile(data: { nickname: string; profile: string }): void {
    this.#data.nickname = User.schema.nickname.parse(data.nickname);
  }

  /**
   * 公開プロフィールの名前の変更
   */
  updateNickname(data: string): void {
    this.#data.nickname = User.schema.nickname.parse(data);
  }

  /**
   * Repository.saveのためのデータ出力
   * TODO: 仕様上変更があり得るfieldのみを出力する
   */
  getChanges() {
    return { ...this.#data };
  }

  /**
   * Repository.addのためのデータ出力
   * Repository.add以外で使わない
   */
  getData() {
    return { ...this.#data };
  }
}
