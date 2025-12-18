import { config } from "@/application/config";
//import { PrismaClient } from '@prisma/client';
import { MkLeaderBoard } from "@/ui/layout/mkleaderboard";
import type { Metadata } from "next";
var request = require('request');

//const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: "むさぽ神田リーダーボード",
  description: "",
  metadataBase: new URL(config.origin + "/"),
};

export default async function Page() {
  const API_URL_RING = 'https://script.google.com/macros/s/AKfycbyJ8vrykgYN6CVplB-nV9kOq6MvyMXPRA2UNB3XFrin9FQnncqQkWEwvq4WqR8yX42Bdg/exec';
  const ring_response = await new Promise((resolve, reject) => {
    request(API_URL_RING, (error, response, body) => resolve(body))
  });
  //if (!ring_response.ok) throw new Error('Network response was not ok');
  const ring_data = JSON.parse(ring_response);
  const onethree_result = ring_data.filter(e => e.rate === '1-3')
  const twofive_result = ring_data.filter(e => e.rate === '2-5')

  const API_URL_TOUR = 'https://script.google.com/macros/s/AKfycbzl-DRSM-NLRxFs4GsS_5p2WqodRO_AUL6qg6D_nOVWRia8F23bu_S6M2ksDrR1Katw-g/exec';
   const tournament_response = await new Promise((resolve, reject) => {
    request(API_URL_TOUR, (error, response, body) => resolve(body))
  });
  //if (!tournament_response.ok) throw new Error('Network response was not ok');
  const tournament_result = JSON.parse(tournament_response);

  return (
    <MkLeaderBoard onethree_result={onethree_result} twofive_result={twofive_result} tournament_result={tournament_result} />
  );
}