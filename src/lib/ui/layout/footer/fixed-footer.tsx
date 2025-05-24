import type { ReactNode } from "react";
import { css } from "styled-system/css";

export function FixedFooter({ children }: { children: ReactNode }) {
  return (
    <div
      className={css({
        width: "90%",
        minWidth: "200px",
        maxWidth: "800px",
        minHeight: "56px",
        "@media screen and (max-width: 767px)": {
          minHeight: "132px",
        },
        position: "fixed",
        bottom: 0,
        left: "50%",
        border: "1px solid #BFBFBF",
        borderRadius: "16px 16px 0px 0px",
        background: "rgba(255,255,255,0.9)",
        boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.25)",
        transform: "translateX(-50%)",
        zIndex: "2",
      })}
    >
      {children}
    </div>
  );
}

export function FixedFooterDeckrecipe({ children }: { children: ReactNode }) {
  return (
    <div
      className={css({
        // width: "90%",
        margin: "auto",
        width: "clamp(200px, 90%, 800px)",
        // minWidth: "200px",
        // maxWidth: "800px",
        minHeight: "56px",
        "@media screen and (max-width: 767px)": {
          minHeight: "132px",
          paddingBottom: "50px",
        },
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%) ",
        zIndex: "2",
        border: "1px solid #BFBFBF",
        borderRadius: "16px 16px 0px 0px",
        background: "rgba(255,255,255,0.9)",
        boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.25)",
        // zIndex: "fixedFooterMenu",
      })}
    >
      {children}
    </div>
  );
}
