import type { ReactNode } from "react";
import { css } from "styled-system/css";

type Props = {
  children: ReactNode;
};

export function HostListWrapper(props: Props) {
  return (
    <div
      className={css({
        display: "flex",
        maxWidth: "1080px",
        flexDirection: "row",
        flexWrap: "wrap",
      })}
    >
      {props.children}
    </div>
  );
}
