import type { ReactNode } from "react";
import { css } from "styled-system/css";
import DotsIcon from "./icons/dots-icon";

type Props = {
  url: string;
  title: ReactNode;
  isHeader?: boolean;
};

export function MenuItemHeader(props: Props) {
  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
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
          fontSize: "16px",
          // fontSize: props.isHeader ? "1rem" : "18px",
        }}
      >
        <a href={props.url}>{props.title}</a>
      </div>
    </div>
  );
}
