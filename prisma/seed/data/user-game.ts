import { createId } from "@/domain/entity";
import { userSeed } from "./user";

export const userGameSeed = [
  {
    id: createId(),
    userId: userSeed["dev1"].id,
    name: "その他",
  },
  {
    id: createId(),
    userId: userSeed["host1"].id,
    name: "その他",
  },
  {
    id: createId(),
    userId: userSeed["host2"].id,
    name: "その他",
  },
];
