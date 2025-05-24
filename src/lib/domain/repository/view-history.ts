import { ViewHistory } from "../entity";

export interface IViewHistoryRepository {
  find(id: ViewHistory["id"]): Promise<ViewHistory>;

  add(entity: ViewHistory): Promise<ViewHistory>;

  save(entity: ViewHistory): Promise<void>;
}
