import { config } from "@/application/config";
import { PrismaClient } from '@prisma/client';
import { MkLeaderBoard } from "@/ui/layout/mkleaderboard";
import type { Metadata } from "next";

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: "むさぽ神田リーダーボード",
  description: "",
  metadataBase: new URL(config.origin + "/"),
};

export default async function Page() {
  let onethree_result = await prisma.ringResult.groupBy({
      by: ['myId'],
      where: {
        checkIn: {
          gte: "2025-06-30T00:00:00.000Z",
          lt: "2025-08-01T00:00:00.000Z",
        },
        rate: " 1-3"

      },
      _sum: {
        result: true,
      },
      _max: {
        nickname: true,
      }
  })
  console.log(onethree_result)
  onethree_result = onethree_result.filter((result => result["_sum"]["result"] > 0)).sort((a, b) => b["_sum"]["result"] - a["_sum"]["result"]);

  let twofive_result = await prisma.ringResult.groupBy({
    by: ['myId'],
    where: {
      checkIn: {
        gte: "2025-06-30T00:00:00.000Z",
        lt: "2025-08-01T00:00:00.000Z",
      },
      rate: " 2-5"

    },
    _sum: {
      result: true,
    },
    _max: {
      nickname: true,
    }
  });
  twofive_result = twofive_result.filter((result => result["_sum"]["result"] > 0)).sort((a, b) => b["_sum"]["result"] - a["_sum"]["result"]);

  return (
    <MkLeaderBoard onethree_result={onethree_result} twofive_result={twofive_result} />
  );
}