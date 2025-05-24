import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  //const { database, userRepository, passwordService } = await getServerContext();
  console.log("hogehoge")
  console.log(await req.json())
  return new NextResponse("", {
    status: 200,
    headers: { "Content-Type": "text/plain" }
})
}

