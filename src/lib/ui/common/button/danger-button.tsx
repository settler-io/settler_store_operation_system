import type { ReactNode } from "react";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";

type Props = {
  children: ReactNode;
  style?: any;
};

export function DangerButton(props: Props) {
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
        padding: "6px 16px 0 20px",
        borderRadius: "20px",
        background: "linear-gradient(180deg, #FFA0A0 0%, #FF0000 50%, #d50000 100%)",
        boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.25)",
        textAlign: "center",
        fontWeight: "500",
        letterSpacing: "2px",
        color: "white",
        fontSize: "16px",
      })}
      style={{ backgroundColor: token("colors.red.500"), ...props.style }}
    >
      {props.children}
    </div>
  );
}
