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
  onethree_result = onethree_result.filter((result => result["_sum"]["result"] > 0)).sort((a, b) => b["_sum"]["result"] - a["_sum"]["result"]).slice(0,5);

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
  twofive_result = twofive_result.filter((result => result["_sum"]["result"] > 0)).sort((a, b) => b["_sum"]["result"] - a["_sum"]["result"]).slice(0,5);

  return (
    <div style={{textShadow: "1px 1px 2px black", paddingTop: "100px", height: "1200px", backgroundImage: `url("/logo.jpg")`, backgroundColor: 'rgba(0, 0, 0, 0.95)', backgroundBlendMode: "darken", backgroundPosition: "360px"}}>
      <div style={{verticalAlign: "top", textAlign: "center", fontSize: "120px", color:'rgba(255, 255, 255)'}}>
          MUSAPO-KANDA-<br/><br/><br/><br/><br/><br/>
          Leader Board
        </div>  
  
      <div style={{display: "inline-block", verticalAlign: "top", paddingLeft: "10%", paddingRight: "30%px", paddingTop: "12%"}}>
      <p style={{fontSize: "72px", paddingBottom: "80px", paddingLeft: "240px", color:'rgba(255, 255, 255)'}}>1-3-3</p>
      <table style={{display: "inline-block", verticalAlign: "top", fontSize: "32px", color:'rgba(255, 255, 255)'}}>
        <tbody>
          <MkLeaderBoard params={onethree_result} />  
        </tbody>
      </table>

      </div>
      
      <div style={{display: "inline-block", verticalAlign: "top", paddingTop: "12%", paddingLeft:"320px"}}>
      <p style={{fontSize: "72px", paddingBottom: "80px", paddingLeft: "200px", color:'rgba(255, 255, 255)'}}>2-5-5</p>
      <table style={{display: "inline-block", verticalAlign: "top", fontSize: "32px", color:'rgba(255, 255, 255)'}}>
        <tbody>
          <MkLeaderBoard params={twofive_result} />
        </tbody>
       
      </table>
      </div>
      </div>
  );
}