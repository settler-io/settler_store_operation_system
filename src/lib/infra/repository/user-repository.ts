import { User } from "@/domain/entity";
import type { IUserRepository } from "@/domain/repository";
import type { TransactionRunnerDatabaseClient } from "../types";
import { throwIfNotFound } from "./common";

/**
 * Userのデータベースアクセスに関する実装
 */
export class UserRepository implements IUserRepository {
  readonly #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async find(id: string): Promise<User> {
    return await this.#client.user
      .findUnique({ where: { id } })
      .then(throwIfNotFound)
      .then((data) => new User(data));
  }

  async findByEmail(email: string): Promise<User> {
    return await this.#client.user
      .findUnique({ where: { email } })
      .then(throwIfNotFound)
      .then((data) => new User(data));
  }

  async save(user: User): Promise<void> {
    // update出来なかった場合はエラーになる
    // 別の処理によりversionが変わっていた場合はエラーになる
    await this.#client.user.update({
      where: {
        id: user.id,
        version: user.version,
      },
      data: {
        ...user.getChanges(),
        version: user.version + 1,
      },
    });
  }

  async add(user: User): Promise<void> {
    await this.#client.user.create({
      data: user.getData(),
    });
  }
}
