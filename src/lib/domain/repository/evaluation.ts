import { Evaluation } from "../entity";

export interface IEvaluationRepository {
  find(id: Evaluation["id"]): Promise<Evaluation>;

  add(entity: Evaluation): Promise<Evaluation>;
}
