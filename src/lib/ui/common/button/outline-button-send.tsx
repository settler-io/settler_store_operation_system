import type { ReactNode } from "react";
import { css } from "styled-system/css";
import { hstack } from "styled-system/patterns";

export function OutlineButtonSend({ label, icon, onClick }: { label: string; icon?: ReactNode; onClick?: () => void }) {
  return (
    <button
      className={hstack({
        font: "700 1em 'Murecho'",
        letterSpacing: "3.6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "10px",
        whiteSpace: "nowrap",
        background: "#00B2FF",
        margin: "auto",
        padding: "0.5em 3em",
        fontWeight: "bold",
        color: "#FFF",
        cursor: "pointer",
      })}
      onClick={onClick}
    >
      {icon && (
        <span
          className={css({
            position: "absolute",
            left: "16px",
          })}
        >
          {icon}
        </span>
      )}
      {label}
    </button>
  );
}
