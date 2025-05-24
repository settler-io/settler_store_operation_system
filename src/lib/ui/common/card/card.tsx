import type { ReactNode } from "react";
import { css } from "styled-system/css";

type Props = {
  children: ReactNode;
  flat?: boolean;
};

export function Card(props: Props) {
  return (
    <div
      className={css({
        padding: "2vh",
        backgroundColor: "#fff",
        borderRadius: "8px",
        outline: ".1rem solid transparent",
        display: "flex",
        border: "solid 1px #d1d1d1",
        // width: "min(100%, 430px)",
        margin: "auto",
      })}
      style={
        props.flat
          ? {}
          : {
              boxShadow: "0 1px 2px 0 rgba(60,64,67,0.1),0 2px 6px 2px rgba(60,64,67,0.05)",
            }
      }
    >
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
          flexDirection: "column",
        })}
      >
        {props.children}
      </div>
    </div>
  );
}
