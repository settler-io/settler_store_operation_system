import { PrismaClient } from '@prisma/client';
import { MkLeaderBoard } from "@/ui/layout/mkleaderboard";

const prisma = new PrismaClient();


export default async function Page() {
  
  let onethree_result = await prisma.ringResult.groupBy({
      by: ['myId'],
      where: {
        checkIn: {
          gte: "2025-06-01T00:00:00Z",
          lt: "2025-07-01T00:00:00Z",
        },
        rate: "1-3"

      },
      _sum: {
        result: true,
      },
      _max: {
        nickname: true,
      }
  })
  onethree_result = onethree_result.filter((result => result["_sum"]["result"] > 0)).sort((a, b) => b["_sum"]["result"] - a["_sum"]["result"]).slice(0,5);

  let twofive_result = await prisma.ringResult.groupBy({
    by: ['myId'],
    where: {
      checkIn: {
        gte: "2025-06-01T00:00:00Z",
        lt: "2025-07-01T00:00:00Z",
      },
      rate: "2-5"

    },
    _sum: {
      result: true,
    },
    _max: {
      nickname: true,
    }
  });
  twofive_result = twofive_result.filter((result => result["_sum"]["result"] > 0)).sort((a, b) => b["_sum"]["result"] - a["_sum"]["result"]).slice(0,5);

  return (
    <div style={{paddingTop: "100px", height: "800px"}}>
      <div style={{display: "inline-block", verticalAlign: "top", paddingLeft: "10%", paddingRight: "30%px", height: "800px"}}>
      <p style={{fontSize: "64px", paddingBottom: "80px"}}>1-3-3</p>
      <MkLeaderBoard params={onethree_result} />
      </div>
      <div style={{display: "inline-block", verticalAlign: "top", paddingLeft: "30%", height: "800px"}}>
      <p style={{fontSize: "64px", paddingBottom: "80px"}}>2-5-5</p>
      <MkLeaderBoard params={twofive_result} />
      </div>
    </div>

  );
}