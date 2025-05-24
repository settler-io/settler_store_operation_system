import { css } from "styled-system/css";

export function PageTitle({ text }: { text: string }) {
  return (
    <h2
      className={css({
        textStyle: "pageTitle",
        textAlign: "center",
        padding: "12px",
        fontFamily: "Murecho",
      })}
    >
      {text}
    </h2>
  );
}
