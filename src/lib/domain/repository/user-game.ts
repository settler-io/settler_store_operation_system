import { UserGame } from "../entity";

export interface IUserGameRepository {
  find(id: UserGame["id"]): Promise<UserGame>;

  add(entity: UserGame): Promise<UserGame>;

  delete(entity: string): Promise<any>;
}
