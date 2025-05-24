import { UserSetting } from "../entity";

export interface IUserSettingRepository {
  find(id: UserSetting["id"]): Promise<UserSetting>;

  add(entity: UserSetting): Promise<UserSetting>;

  save(entity: UserSetting): Promise<void>;
}
