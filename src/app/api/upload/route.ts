import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2"

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'torecaswap'
});

export async function POST(req: NextRequest) {
  //const { database, userRepository, passwordService } = await getServerContext();
  const json_string_response = await req.json()


  console.log("hagehage")
  const tansactionLog = JSON.parse(json_string_response.xxxx).result.transactionLog
  console.log("hehehe")
  console.log(tansactionLog)
  for (const [key, value] of Object.entries(tansactionLog)) {
    for (const element of value) {
      console.log(element);
      const receiptID = element.receiptID
      const orderHistory = element.orderHistory
      const orderData = element.orderData
      const entryTime = element.entrytime.replace("T", " ").replace("Z", "")
      const outTime = element.outtime.replace("T", " ").replace("Z", "")
      const stayedMinutes = element.stayedMinutes
      const total = element.total
      const totalReduce = element.totalReduce == null ? 0 : element.totalReduce
      const tax = element.tax
      const taxInternal = element.taxInternal
      const taxReduced = element.taxReduced
      const taxReducedInternal = element.taxReducedInternal
      const discount = element.discount

      connection.query(
        'INSERT INTO transaction (id, version, total, total_reduced, tax, tax_internal, tax_reduced, tax_reduced_internal, discount, entry_time, out_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [receiptID, 1, total, totalReduce, tax, taxInternal, taxReduced, taxReducedInternal, discount, entryTime, outTime],
        (error: any, results: any) => {
          console.log(error)
        }
      );

      for (const element of orderHistory) {
        console.log("aaaaa")
        console.log(element.lineUser)
        const id = receiptID + element.orderedTime
        const lineUserId = element.lineUser == null ? "" : element.lineUser.lineUserId
        const lineUserName = element.lineUser == null ? "" : element.lineUser.lineUserName
        const orderType = element.orderType
        const orderedTime = element.orderedTime.replace("T", " ").replace("Z", "")

        connection.query(
          'INSERT INTO order_history (id, version, transaction_id, line_user_id, line_user_name, order_type, ordered_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, 1, receiptID, lineUserId, lineUserName, orderType, orderedTime],
          (error: any, results: any) => {
            console.log(error)
          }
        );
      }
    }
  }

  return new NextResponse("", {
    status: 200,
    headers: { "Content-Type": "text/plain" }
})
}

