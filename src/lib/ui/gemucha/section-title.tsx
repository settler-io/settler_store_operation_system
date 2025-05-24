import type { ReactNode } from "react";
import { css } from "styled-system/css";

type Props = {
  title: ReactNode;
  icon?: ReactNode;
  className?: any;
};

export function SectionTitle(props: Props) {
  return (
    <div
      className={css({
        // fontSize: "28px",
        fontFamily: "Murecho",
        // fontOpticalSizing: "auto",
        fontWeight: "800",
        lineHeight: "31px",
        // padding: "4px 0",
        // marginBottom: "0px",
        display: "flex",
        // color:"#555",
        fontSize: "3vh",
        letterSpacing: "0.2em",
      })}
      style={props.className}
    >
      {props.title}
      {props.icon}
    </div>
  );
}

export function SectionTitleProfile(props: Props) {
  return (
    <div
      className={css({
        // fontSize: "28px",
        fontFamily: "Murecho",
        // fontOpticalSizing: "auto",
        fontWeight: "800",
        lineHeight: "31px",
        // padding: "4px 0",
        // marginBottom: "0px",
        display: "flex",
        // color:"#555",
        fontSize: "1.7em",
        letterSpacing: "0.1em",
      })}
      style={props.className}
    >
      {props.title}
      {props.icon}
    </div>
  );
}
