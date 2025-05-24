import { HostImage } from "../entity";

export interface IHostImageRepository {
  find(id: HostImage["id"]): Promise<HostImage>;

  add(entity: HostImage): Promise<HostImage>;

  save(entity: HostImage): Promise<void>;

  delete(entity: HostImage): Promise<void>;
}
