import { createId } from "@/domain/entity";
import { reservationSeed } from "./reservation";
import { userSeed } from "./user";

export const evaluationSeed = [
  {
    id: createId(),
    side: "host",
    reservationId: reservationSeed["toDevelop"].id,
    evaluateUserId: userSeed["dev1"].id,
    evaluatedUserId: userSeed["dev1"].id,
    score: 3,
    comment: "very good!!",
  },
];
