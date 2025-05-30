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
    for (const element of value) {
      console.log(element);
      const receiptID = element.receiptID
      const orderHistory = element.orderHistory
      const orderData = element.orderData
      const entryTime = element.entrytime
      const outtime = element.outtime
      const stayedMinutes = element.stayedMinutes
      const total = element.total
      const totalReduce = element.totalReduce
      const tax = element.tax
      const taxInternal = element.taxInternal
      const taxReducedInternal = element.taxReducedInternal
      const discount = element.discount
      console.log(receiptID);
    }
    //console.log(value);
    //console.log(receiptID);
  }

  return new NextResponse("", {
    status: 200,
    headers: { "Content-Type": "text/plain" }
})
}

