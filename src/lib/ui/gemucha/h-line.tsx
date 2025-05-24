import { css } from "styled-system/css";

type Props = {
  startColor?: string;
  endColor?: string;
  height?: string;
};

export function HLine(props: Props) {
  return (
    <div
      className={css({
        display: "flex",
        width: "100%",
        borderRadius: "4px",
        flexDirection: "row",
        flexWrap: "wrap",
      })}
      style={{
        background: `linear-gradient(45deg, ${props.startColor}, ${props.endColor})`,
        height: `${props.height ? props.height : "8px"}`,
      }}
    ></div>
  );
}
