import { UserSetting } from "@/domain/entity";
import type { IUserSettingRepository } from "@/domain/repository/user-setting";
import type { TransactionRunnerDatabaseClient } from "../types";
import { throwIfNotFound } from "./common";

export class UserSettingRepository implements IUserSettingRepository {
  readonly #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async find(id: string): Promise<UserSetting> {
    return await this.#client.userSetting
      .findUnique({ where: { id } })
      .then(throwIfNotFound)
      .then((data) => new UserSetting(data));
  }

  async add(setting: UserSetting): Promise<UserSetting> {
    return await this.#client.userSetting
      .create({
        data: {
          ...setting.getData(),
        },
      })
      .then((data) => new UserSetting(data));
  }
  async save(setting: UserSetting): Promise<void> {
    // updateの排他制御のためにversionの管理をしている
    // update出来なかった場合はエラーになる
    // 別の処理によりversionが変わっていた場合はエラーになる
    await this.#client.userSetting.update({
      where: {
        id: setting.id,
        version: setting.version,
      },
      data: {
        ...setting.getChanges(),
        version: setting.version + 1,
      },
    });
  }
}
