import type { ReactNode } from "react";
import { css } from "styled-system/css";
type Props = {
  children: ReactNode;
};
export function CardBody(props: Props) {
  return <div className={css({ display: "flex", width: "100%" })}>{props.children}</div>;
}
