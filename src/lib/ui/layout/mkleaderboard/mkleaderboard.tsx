"use client";

type Props = {
  Params: {
    start: string;
    end: string;
  };
};
  

export function MkLeaderBoard({params}: {params: Array<any>}) {
  return (
    params.map((row, index) => (
        <div style={{paddingBottom: "20px"}}>
          <div style={{display: "inline-block", verticalAlign: "top", fontSize: "32px", paddingRight: "20px"}}>{index + 1}位</div>
          <div style={{display: "inline-block", verticalAlign: "top", fontSize: "32px", paddingRight: "20px"}}>{row["_max"]['nickname']}</div>
          <div style={{display: "inline-block", verticalAlign: "top", fontSize: "32px", paddingRight: "20px"}}>{row["_sum"]['result']} MD</div>
        </div>
    ))
  )
}