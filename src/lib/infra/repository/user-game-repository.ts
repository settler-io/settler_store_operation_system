import { UserGame } from "@/domain/entity";
import type { IUserGameRepository } from "@/domain/repository";
import type { TransactionRunnerDatabaseClient } from "../types";
import { throwIfNotFound } from "./common";

export class UserGameRepository implements IUserGameRepository {
  readonly #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async find(id: string): Promise<UserGame> {
    return await this.#client.userGame
      .findUnique({ where: { id } })
      .then(throwIfNotFound)
      .then((data) => new UserGame(data));
  }

  async add(val: UserGame): Promise<UserGame> {
    return await this.#client.userGame
      .create({
        data: {
          ...val.getData(),
        },
      })
      .then((data) => new UserGame(data));
  }
  async delete(val: string) {
    return await this.#client.userGame.delete({
      where: {
        id: val,
      },
    });
  }
}
