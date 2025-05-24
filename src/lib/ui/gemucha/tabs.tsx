"use client";

import { useState, type ReactNode } from "react";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";
import { HLine } from "./h-line";

type Props = {
  headers: ReactNode[];
  bodies: ReactNode[];
};

export function Tabs(props: Props) {
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div
        className={css({
          width: "100%",
          display: "flex",
          flexDirection: "column",
        })}
      >
        <div
          className={css({
            width: "100%",
            display: "flex",
            justifyContent: "center",
          })}
        >
          {props.headers.map((h, index) => (
            <div
              key={index}
              style={{
                opacity: selected === index ? 1 : 0.6,
                fontWeight: "bold",
                color: "white",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelected(index);
              }}
            >
              {h}
            </div>
          ))}
        </div>
        <HLine startColor={token("colors.gray.300")} endColor={token("colors.gray.300")} />
      </div>
      <div>{props.bodies[selected]}</div>
    </div>
  );
}
