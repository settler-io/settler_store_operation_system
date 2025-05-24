import { HostImage } from "@/domain/entity";
import type { IHostImageRepository } from "@/domain/repository";
import type { TransactionRunnerDatabaseClient } from "../types";
import { throwIfNotFound } from "./common";

export class HostImageRepository implements IHostImageRepository {
  readonly #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async find(id: string): Promise<HostImage> {
    return await this.#client.hostImage
      .findUnique({ where: { id } })
      .then(throwIfNotFound)
      .then((data) => new HostImage(data));
  }

  async add(val: HostImage): Promise<HostImage> {
    return await this.#client.hostImage
      .create({
        data: {
          ...val.getData(),
        },
      })
      .then((data) => new HostImage(data));
  }

  async save(val: HostImage): Promise<void> {
    // updateの排他制御のためにversionの管理をしている
    // update出来なかった場合はエラーになる
    // 別の処理によりversionが変わっていた場合はエラーになる
    await this.#client.hostImage.update({
      where: {
        id: val.id,
        version: val.version,
      },
      data: {
        ...val.getChanges(),
        version: val.version + 1,
      },
    });
  }

  async delete(val: HostImage) {
    await this.#client.hostImage.delete({
      where: {
        id: val.id,
      },
    });
  }
}
