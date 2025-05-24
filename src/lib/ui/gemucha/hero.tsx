import type { ReactNode } from "react";
import { css } from "styled-system/css";

type Props = {
  children: ReactNode;
};

export function Hero(props: Props) {
  return (
    <div
      className={css({
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        // width: "50%",
        // flexDirection: "row",
        // flexWrap: "wrap",
        background: `url("/images/gemucha/gemucha_mv_bg.jpg") no-repeat center / cover`,
      })}
    >
      {props.children}
    </div>
  );
}
