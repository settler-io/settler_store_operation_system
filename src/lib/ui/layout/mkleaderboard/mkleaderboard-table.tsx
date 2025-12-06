"use client";

export function MkLeaderBoardTable({params, counter}: {params: Array<any>, counter: number}) {
  return (
    params.map((row, index) => (
      <tr>
        <td style={{verticalAlign: "top", fontSize: "64px", paddingBottom: "60px"}}>{counter + index + 1}位</td>
        <td style={{verticalAlign: "top", fontSize: "64px", paddingBottom: "60px", paddingRight: "10px"}}>{row['name']}</td>
        <td style={{verticalAlign: "top", fontSize: "64px", paddingBottom: "60px", textAlign: "right"}}>{row['points']} MD</td>
      </tr>
    ))
  )
}