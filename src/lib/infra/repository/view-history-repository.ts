import { ViewHistory } from "@/domain/entity";
import type { IViewHistoryRepository } from "@/domain/repository";
import type { TransactionRunnerDatabaseClient } from "../types";
import { throwIfNotFound } from "./common";

export class ViewHistoryRepository implements IViewHistoryRepository {
  readonly #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async find(id: string): Promise<ViewHistory> {
    return await this.#client.viewHistory
      .findUnique({ where: { id } })
      .then(throwIfNotFound)
      .then((data) => new ViewHistory(data));
  }

  async add(val: ViewHistory): Promise<ViewHistory> {
    return await this.#client.viewHistory
      .create({
        data: {
          ...val.getData(),
        },
      })
      .then((data) => new ViewHistory(data));
  }

  async save(val: ViewHistory): Promise<void> {
    // updateの排他制御のためにversionの管理をしている
    // update出来なかった場合はエラーになる
    // 別の処理によりversionが変わっていた場合はエラーになる
    await this.#client.viewHistory.update({
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
}
