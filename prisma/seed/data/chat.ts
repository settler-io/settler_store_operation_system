import { createId } from "@/domain/entity";
import { userSeed } from "./user";

export const chatSeed = [
  {
    id: createId(),
    sendUserId: userSeed["dev1"].id,
    receiveUserId: userSeed["host1"].id,
    comment: "お願いします",
    sendAt: new Date("2022-01-02"),
  },
];
