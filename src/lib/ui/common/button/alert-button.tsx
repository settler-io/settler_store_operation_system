import type { ComponentProps } from "react";
import { css } from "styled-system/css";

export function AlertButton(props: { label: string } & ComponentProps<"button">) {
  return (
    <button
      className={css({
        width: "100%",
        height: "40px",
        cursor: props.disabled ? "not-allowed" : "pointer",
        border: "1px solid transparent",
        borderRadius: "4px",
        padding: "8px 12px",
        backgroundColor: "alert",
        color: "#ffffff",
        textStyle: "buttonLabel",
        _disabled: {
          color: "textDisabled",
          backgroundColor: "disabled",
        },
      })}
      {...props}
    >
      {props.label}
    </button>
  );
}
