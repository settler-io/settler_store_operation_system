import { createId } from "@/domain/entity";
import { userSeed } from "./user";

export const reservationSeed = {
  toDevelop: {
    id: createId(),
    hostUserId: userSeed["host1"].id,
    guestUserId: userSeed["dev1"].id,
    startAt: new Date("2024-06-22"),
    endAt: new Date("2025-06-22"),
    price: 0,
    game: "その他",
  },
};
