import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  //const { database, userRepository, passwordService } = await getServerContext();
  const json_string_response = await req.json()
  console.log("hagehage")
  //console.log(json_string_response.xxxx)
  const tansactionLog = JSON.parse(json_string_response.xxxx).result.transactionLog
  console.log("hehehe")
  //console.log(tansactionLog)
  for (const [key, value] of Object.entries(tansactionLog)) {
    console.log(`${key}: ${value}`);
  }

  return new NextResponse("", {
    status: 200,
    headers: { "Content-Type": "text/plain" }
})
}

