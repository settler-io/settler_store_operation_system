import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";

type Props = {
  children: ReactNode;
  style?: CSSProperties | undefined;
  onClick?: MouseEventHandler<HTMLDivElement> | undefined;
};

export function MainButton(props: Props) {
  return (
    <div
      // className={css({
      //   padding: "8px",
      //   borderRadius: "8px",
      //   color: "white",
      // })}
      className={css({
        width: "auto",
        // width: "140px",
        height: "36px",
        padding: "0.4em 2.7em 0.6em 3em",
        borderRadius: "20px",
        background: "linear-gradient(180deg, #01F0FF 0%, #0094FF 50%, #01498B 100%)",
        boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.25)",
        textAlign: "center",
        fontWeight: "500",
        letterSpacing: "2px",
        color: "white",
        fontSize: "16px",
      })}
      style={{ backgroundColor: token("colors.gemcha"), ...props.style }}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}
