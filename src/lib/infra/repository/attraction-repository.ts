import { Attraction } from "@/domain/entity";
import type { IAttractionRepository } from "@/domain/repository/attraction";
import type { TransactionRunnerDatabaseClient } from "../types";
import { throwIfNotFound } from "./common";

export class AttractionRepository implements IAttractionRepository {
  readonly #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async find(id: string): Promise<Attraction> {
    return await this.#client.attraction
      .findUnique({ where: { id } })
      .then(throwIfNotFound)
      .then((data) => new Attraction(data));
  }

  async add(val: Attraction): Promise<Attraction> {
    return await this.#client.attraction
      .create({
        data: {
          ...val.getData(),
        },
      })
      .then((data) => new Attraction(data));
  }
  async save(val: Attraction): Promise<void> {
    // updateの排他制御のためにversionの管理をしている
    // update出来なかった場合はエラーになる
    // 別の処理によりversionが変わっていた場合はエラーになる
    await this.#client.attraction.update({
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

  async delete(val: Attraction): Promise<void> {
    await this.#client.attraction.delete({
      where: {
        id: val.id,
      },
    });
  }
}
