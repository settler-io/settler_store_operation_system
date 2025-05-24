import { resetDatabase } from "@/infra/testing";
import { PrismaClient } from "@prisma/client";
import { attractionSeed } from "./data/attraction";
import { chatSeed } from "./data/chat";
import { evaluationSeed } from "./data/evaluation";
import { hostImageSeed } from "./data/host-image";
import { reservationSeed } from "./data/reservation";
import { userSeed } from "./data/user";
import { userGameSeed } from "./data/user-game";
import { userSettingSeed } from "./data/user-setting";
import { viewHistorySeed } from "./data/view-history";

const prisma = new PrismaClient();

async function main() {
  await resetDatabase(prisma);

  await prisma.user.createMany({ data: Object.values(userSeed) });
  await prisma.userSetting.createMany({ data: userSettingSeed });
  await prisma.userGame.createMany({ data: userGameSeed });
  await prisma.hostImage.createMany({ data: hostImageSeed });
  await prisma.reservation.createMany({ data: Object.values(reservationSeed) });
  await prisma.viewHistory.createMany({ data: viewHistorySeed });
  await prisma.attraction.createMany({ data: attractionSeed });
  await prisma.evaluation.createMany({ data: evaluationSeed });
  await prisma.chat.createMany({ data: chatSeed });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
