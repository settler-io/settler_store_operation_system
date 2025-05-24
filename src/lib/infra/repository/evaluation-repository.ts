import { Evaluation } from "@/domain/entity";
import type { IEvaluationRepository } from "@/domain/repository";
import type { TransactionRunnerDatabaseClient } from "../types";
import { throwIfNotFound } from "./common";

export class EvaluationRepository implements IEvaluationRepository {
  readonly #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async find(id: string): Promise<Evaluation> {
    return await this.#client.evaluation
      .findUnique({ where: { id } })
      .then(throwIfNotFound)
      .then((data) => new Evaluation(data));
  }

  async add(val: Evaluation): Promise<Evaluation> {
    return await this.#client.evaluation
      .create({
        data: {
          ...val.getData(),
        },
      })
      .then((data) => new Evaluation(data));
  }
}
