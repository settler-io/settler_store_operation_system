import { createId } from "@/domain/entity";
import { userSeed } from "./user";

export const viewHistorySeed = [
  {
    id: createId(),
    viewUserId: userSeed["dev1"].id,
    viewedUserId: userSeed["dev1"].id,
    viewAt: new Date("2022-01-02"),
  },
];
