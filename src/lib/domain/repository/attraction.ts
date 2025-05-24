import { Attraction } from "../entity";

export interface IAttractionRepository {
  find(id: Attraction["id"]): Promise<Attraction>;

  add(entity: Attraction): Promise<Attraction>;

  save(entity: Attraction): Promise<void>;

  delete(entity: Attraction): Promise<void>;
}
