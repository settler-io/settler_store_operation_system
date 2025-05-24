import { Reservation } from "@/domain/entity";
import type { IReservationRepository } from "@/domain/repository";
import type { TransactionRunnerDatabaseClient } from "../types";
import { throwIfNotFound } from "./common";

export class ReservationRepository implements IReservationRepository {
  readonly #client: TransactionRunnerDatabaseClient;

  constructor(client: TransactionRunnerDatabaseClient) {
    this.#client = client;
  }

  async find(id: string): Promise<Reservation> {
    return await this.#client.reservation
      .findUnique({ where: { id } })
      .then(throwIfNotFound)
      .then((data) => new Reservation(data));
  }

  async add(val: Reservation): Promise<Reservation> {
    return await this.#client.reservation
      .create({
        data: {
          ...val.getData(),
        },
      })
      .then((data) => new Reservation(data));
  }
}
