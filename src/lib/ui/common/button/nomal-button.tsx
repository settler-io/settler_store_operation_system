import type { ReactNode } from "react";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";

type Props = {
  children: ReactNode;
  style?: any;
};

export function NomalButton(props: Props) {
  return (
    <div
      // className={css({
      //   padding: "8px",
      //   borderRadius: "8px",
      //   color: "white",
      // })}
      className={css({
        width: "130px",
        height: "36px",
        padding: "6px 16px 0 20px",
        borderRadius: "20px",
        background: "linear-gradient(180deg, #FFA331 0%, #FF7200 50%, #DB4F00 100%)",
        boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.25)",
        textAlign: "center",
        fontWeight: "500",
        letterSpacing: "2px",
        color: "white",
        fontSize: "16px",
        float: "right",
        fontFamily: "Murecho",
      })}
      style={{ backgroundColor: token("colors.red.500"), ...props.style }}
    >
      {props.children}
    </div>
  );
}
