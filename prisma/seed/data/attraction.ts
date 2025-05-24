import { createId } from "@/domain/entity";
import { userSeed } from "./user";

export const attractionSeed = [
  {
    id: createId(),
    userId: userSeed["host1"].id,
    startAt: new Date("2024-06-22"),
    endAt: new Date("2025-06-22"),
    message: "雑談しましょう",
  },
  {
    id: createId(),
    userId: userSeed["host2"].id,
    startAt: new Date("2024-06-22"),
    endAt: new Date("2025-06-22"),
    message: "雑談しましょう",
  },
];
