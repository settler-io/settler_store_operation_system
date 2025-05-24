import type { ComponentProps } from "react";
import { css } from "styled-system/css";

export function PrimaryButton(props: { label: string } & ComponentProps<"button">) {
  return (
    <button
      className={css({
        width: "100%",
        height: "40px",
        cursor: props.disabled ? "not-allowed" : "pointer",
        border: "1px solid transparent",
        borderRadius: "8px",
        padding: "8px 12px",
        background: "linear-gradient(180deg, #2973E5 2%, #6096E9 53%, #99C1FF 100%)",
        color: "#ffffff",
        textStyle: "buttonLabel",
        _disabled: {
          color: "#ebebeb",
          backgroundColor: "disabled",
          background: "linear-gradient(180deg, #999999 2%, #ababab 53%, #dbdbdb 100%)",
        },
      })}
      {...props}
    >
      {props.label}
    </button>
  );
}
