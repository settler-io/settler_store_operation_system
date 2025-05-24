import { css } from "styled-system/css";

type Props = {
  percent: number;
};

export function StarRates(props: Props) {
  return (
    <div
      className={css({
        unicodeBidi: "bidi-override",
        color: "#c5c5c5",
        fontSize: "20px",
        height: "25px",
        width: "110px",
        margin: "0 auto",
        position: "relative",
        padding: "0",
        letterSpacing: "2px",
        // textShadow: "0px 1px 0 #a2a2a2",
      })}
    >
      <div
        className={css({
          color: "orange",
          padding: "0",
          position: "absolute",
          zIndex: "1",
          display: "flex",
          top: "0",
          left: "0",
          overflow: "hidden",
          letterSpacing: "2px",
        })}
        style={{
          width: `${props.percent * 100}%`,
        }}
      >
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
      </div>
      <div
        className={css({
          padding: "0",
          display: "flex",
          zIndex: "0",
        })}
      >
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
      </div>
    </div>
  );
}
