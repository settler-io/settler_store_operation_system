import { css } from "styled-system/css";

type Props = {
  marginTop?: string;
  marginBottom?: string;
};

export function Divider({ marginTop, marginBottom }: Props) {
  return (
    <div
      className={css({
        width: "100%",
        borderTop: "1px solid #cccccc",
      })}
      style={{
        marginTop: marginTop ?? 0,
        marginBottom: marginBottom ?? 0,
      }}
    ></div>
  );
}
