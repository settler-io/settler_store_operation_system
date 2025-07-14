"use client";

export function MkLeaderBoard({params}: {params: Array<any>}) {
  return (
    params.map((row, index) => (
      <tr>
        <td style={{verticalAlign: "top", fontSize: "64px", paddingBottom: "60px"}}>{index + 1}位</td>
        <td style={{verticalAlign: "top", fontSize: "64px", paddingBottom: "60px", paddingRight: "10px"}}>{row["_max"]['nickname']}</td>
        <td style={{verticalAlign: "top", fontSize: "64px", paddingBottom: "60px", textAlign: "right"}}>{row["_sum"]['result']} MD</td>
      </tr>
      //        <div key={index} style={{paddingBottom: "20px", color:'rgba(255, 255, 255)'}}>
//          <div style={{display: "inline-block", verticalAlign: "top", fontSize: "32px", paddingRight: "20px"}}>{index + 1}位</div>
//          <div style={{display: "inline-block", verticalAlign: "top", fontSize: "32px", paddingInlineEnd: "5em"}}>{row["_max"]['nickname']}</div>
//          <div style={{display: "inline-block", verticalAlign: "top", fontSize: "32px", paddingRight: "20px"}}>{row["_sum"]['result']} MD</div>
//        </div>
    ))
  )
} 