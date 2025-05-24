import type { ReactNode } from "react";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";
import { UserIconSquare } from "../common";
import { HLine } from "./h-line";

type Props = {
  date: ReactNode;
  imageUrl: string;
  name: string;
  value?: number;
};

export function EarningItemMonthlySales(props: Props) {
  return (
    <div>
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginY: "8px",
        })}
      >
        <div
          className={css({
            flex: 1,
            fontWeight: "700",
          })}
        >
          {props.date}
        </div>
        {/* {props.imageUrl && (
          <div style={{border:"solid 2px #50B0F9",borderRadius:"6px"}}>
            <UserIconSquare imageUrl={props.imageUrl} size="64px" />
          </div>
        )} */}
        <div
          className={css({
            // width: "10rem",
            display: "flex",
            justifyContent: "left",
            alignItems: "center",
            marginLeft: "1rem",
            fontWeight: "500",
          })}
        >
          {props.name}
        </div>
      </div>
      <HLine startColor={token("colors.gray.300")} endColor={token("colors.gray.300")} height="2px" />
    </div>
  );
}

export function EarningItem(props: Props) {
  return (
    <div>
      <div
        className={css({
          flex: 1,
          fontWeight: "700",
        })}
      >
        {props.date}
      </div>
      <div
        className={css({
          display: "flex",
          width: "100%",
          marginY: "8px",
          alignItems: "flex-end",
        })}
      >
        {props.imageUrl && (
          <div style={{ border: "solid 2px #50B0F9", borderRadius: "6px" }}>
            <UserIconSquare imageUrl={props.imageUrl} size="40px" />
          </div>
        )}
        <div
          className={css({
            width: "10rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "left",
            alignItems: "left",
            marginLeft: "1vh",
            fontSize: "1rem",
            fontWeight: "500",
          })}
        >
          <div>{props.value}円</div>
          <div>{props.name}</div>
        </div>
      </div>
      <HLine startColor={token("colors.gray.300")} endColor={token("colors.gray.300")} height="2px" />
    </div>
  );
}
