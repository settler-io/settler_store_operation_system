import { createId, initialVersion, type Entity } from "../common";
import { EVALUATION_SCHEMA } from "./schema";

interface Data {
  readonly id: string;
  version: number;
  reservationId: string;
  side: string;
  evaluatedUserId: string;
  evaluateUserId: string;
  score: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Evaluation implements Entity {
  static schema = EVALUATION_SCHEMA;

  readonly #data: Data;

  get id() {
    return this.#data.id;
  }

  get version() {
    return this.#data.version;
  }

  get reservationId() {
    return this.#data.reservationId;
  }

  get comment() {
    return this.#data.comment;
  }

  get side() {
    return this.#data.side;
  }

  get evaluatedUserId() {
    return this.#data.evaluateUserId;
  }

  get evaluateUserId() {
    return this.#data.evaluateUserId;
  }
  get score() {
    return this.#data.score;
  }

  get updatedAt() {
    return this.#data.updatedAt;
  }

  static create(
    data: {
      reservationId: string;
      side: string;
      evaluateUserId: string;
      evaluatedUserId: string;
      score: number;
      comment: string;
    },
    serverCurrentTime = new Date(),
  ): Evaluation {
    return new Evaluation({
      id: createId(),
      version: initialVersion(),
      reservationId: data.reservationId,
      side: data.side,
      evaluateUserId: data.evaluateUserId,
      evaluatedUserId: data.evaluatedUserId,
      score: data.score,
      comment: data.comment,
      createdAt: serverCurrentTime,
      updatedAt: serverCurrentTime,
    });
  }

  constructor(data: Record<keyof Data, unknown>) {
    this.#data = {
      id: Evaluation.schema.id.parse(data.id),
      version: Evaluation.schema.version.parse(data.version),
      reservationId: Evaluation.schema.reservationId.parse(data.reservationId),
      side: Evaluation.schema.side.parse(data.side),
      evaluateUserId: Evaluation.schema.evaluateUserId.parse(data.evaluateUserId),
      evaluatedUserId: Evaluation.schema.evaluatedUserId.parse(data.evaluatedUserId),
      score: Evaluation.schema.score.parse(data.score),
      comment: Evaluation.schema.comment.parse(data.comment),
      createdAt: Evaluation.schema.createdAt.parse(data.createdAt),
      updatedAt: Evaluation.schema.updatedAt.parse(data.updatedAt),
    };
  }

  updateComment(val: string) {
    this.#data.comment = val;
  }

  /**
   * 仕様上、変更される値のみを返却
   */
  getChanges() {
    return {
      ...this.#data,
    };
  }

  /**
   * Repository.addのためのデータ出力
   * Repository.add以外で使わない
   */
  getData() {
    return { ...this.#data };
  }
}
