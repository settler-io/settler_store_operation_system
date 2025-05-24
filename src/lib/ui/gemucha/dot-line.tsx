import { css } from "styled-system/css";

type Props = {
  dotColor?: string;
  dotSize?: string;
  width?: string;
};

export function DotLine(props: Props) {
  return (
    <div
      className={css({
        border: "none",
        backgroundColor: "#fff",
      })}
      style={{
        marginTop: "1.5vh",
        borderTop: `${props.dotSize ? props.dotSize : "4px"} dotted ${props.dotColor ? props.dotColor : "black"}`,
        height: props.dotSize ? props.dotSize : "8px",
        // width:"min(80%, 500px)",
        width: props.width ? props.width : "min(80%, 500px)",
      }}
    ></div>
  );
}

export function DotLineProfile(props: Props) {
  return (
    <div
      className={css({
        border: "none",
        backgroundColor: "#fff",
      })}
      style={{
        marginTop: "1.5vh",
        borderTop: `${props.dotSize ? props.dotSize : "4px"} dotted ${props.dotColor ? props.dotColor : "black"}`,
        height: props.dotSize ? props.dotSize : "8px",
        // width:"min(100%, 500px)",
        width: props.width ? props.width : "min(120%, 500px)",
      }}
    ></div>
  );
}
