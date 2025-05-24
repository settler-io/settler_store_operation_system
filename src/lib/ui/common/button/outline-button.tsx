import type { ReactNode } from "react";
import { css } from "styled-system/css";
import { hstack } from "styled-system/patterns";

export function OutlineButton({ label, icon, onClick }: { label: string; icon?: ReactNode; onClick?: () => void }) {
  return (
    <button
      className={hstack({
        width: "240px",
        height: "40px",
        justifyContent: "center",
        lineHeight: "40px",
        padding: "11px 15px",
        border: "1px solid #333333",
        borderRadius: "4px",
        whiteSpace: "nowrap",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: "700",
        position: "relative",
        margin: "0em auto",
        fontFamily: "'Murecho'",
      })}
      onClick={onClick}
    >
      {icon && (
        <span
          className={css({
            // position: "absolute",
            // left: "16px",
          })}
        >
          {icon}
        </span>
      )}
      {label}
    </button>
  );
}
