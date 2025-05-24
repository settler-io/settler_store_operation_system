import { Chat } from "../entity";

export interface IChatRepository {
  find(id: Chat["id"]): Promise<Chat>;

  add(entity: Chat): Promise<Chat>;
}
