import { User } from "../entity";

export interface IUserRepository {
  find(id: User["id"]): Promise<User>;

  add(entity: User): Promise<void>;

  save(entity: User): Promise<void>;
}
