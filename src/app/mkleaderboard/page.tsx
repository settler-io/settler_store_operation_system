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
  const monthBegin = new Date().getMonth() + 1;
  const monthEnd = new Date().getMonth() + 2;
  const monthBeginZeroPad = ('0' + monthBegin).slice(-2)
  const monthEndZeroPad = ('0' + monthEnd).slice(-2)

  const API_URL_TOUR = 'https://script.google.com/macros/s/AKfycbyJ8vrykgYN6CVplB-nV9kOq6MvyMXPRA2UNB3XFrin9FQnncqQkWEwvq4WqR8yX42Bdg/exec';
  const response = await fetch(API_URL_TOUR);
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  const onethree_result = data.filter(e => e.rate === '1-3')
  const twofive_result = data.filter(e => e.rate === '2-5')

  return (
    <MkLeaderBoard onethree_result={onethree_result} twofive_result={twofive_result} />
  );
}