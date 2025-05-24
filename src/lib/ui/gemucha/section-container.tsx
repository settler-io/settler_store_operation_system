import type { CSSProperties, ReactNode } from "react";
import { css } from "styled-system/css";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
};

export function SectionContainer(props: Props) {
  return (
    <div
      className={css({
        display: "flex",
        maxWidth: "1080px",
        margin: "32px auto 16px",
        flexDirection: "column",
        color: "#555",
      })}
      style={props.style}
    >
      {props.children}
    </div>
  );
}
