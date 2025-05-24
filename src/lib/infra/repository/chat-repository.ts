import { Chat } from "@/domain/entity";
import type { IChatRepository } from "@/domain/repository";
import type { TransactionRunnerDatabaseClient } from "../types";
import { throwIfNotFound } from "./common";

export class ChatRepository implements IChatRepository {
  readonly #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async find(id: string): Promise<Chat> {
    return await this.#client.chat
      .findUnique({ where: { id } })
      .then(throwIfNotFound)
      .then((data) => new Chat(data));
  }

  async add(val: Chat): Promise<Chat> {
    return await this.#client.chat
      .create({
        data: {
          ...val.getData(),
        },
      })
      .then((data) => new Chat(data));
  }
}
