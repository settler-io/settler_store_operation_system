import type { ReactNode } from "react";
import { css } from "styled-system/css";

type Props = {
  icon: ReactNode;
  title: ReactNode;
};

export function CardHeader(props: Props) {
  return (
    <div
      className={css({
        display: "flex",
        width: "100%",
        paddingBottom: "16px",
      })}
    >
      {props.icon}
      <div
        className={css({
          display: "flex",
          flex: 1,
        })}
      >
        {props.title}
      </div>
    </div>
  );
}
