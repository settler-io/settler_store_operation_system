import type { ReactNode } from "react";
import { css } from "styled-system/css";
import DotsIcon from "./icons/dots-icon";

type Props = {
  url: string;
  title: ReactNode;
  isHeader?: boolean;
};

export function MenuItem(props: Props) {
  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingBottom: "1em",
      })}
      style={props.isHeader ? {} : {}}
    >
      <DotsIcon />
      <div
        className={css({
          fontWeight: "700",
        })}
        style={{
          fontFamily: "Murecho",
          color: "#333333",
          fontSize: "18px",
          letterSpacing: "0.1em",
          // fontSize: props.isHeader ? "1.2rem" : "18px",
        }}
      >
        <a href={props.url}>{props.title}</a>
      </div>
    </div>
  );
}
