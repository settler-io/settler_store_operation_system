"use client";

import { useState, type ReactNode } from "react";
import { css, cx } from "styled-system/css";

export function Tab({
  selected = 0,
  header,
  body,
  className,
  headerClassName,
  bodyClassName,
}: {
  size?: string;
  selected: number;
  header: string[];
  body: ReactNode[];
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}) {
  const [currentTab, setCurrentTab] = useState(selected);
  return (
    <div
      className={cx(
        css({
          w: "100%",
        }),
        className,
      )}
    >
      <div
        className={cx(
          css({
            display: "flex",
            w: "100%",
            borderRadius: "4px",
          }),
          headerClassName,
        )}
      >
        {header.map((h, index) => {
          return (
            <div
              key={index}
              id={`tab_header_${index}`}
              className={css({
                justifyContent: "center",
                flexDirection: "row",
                flex: "1",
                textAlign: "center",
                cursor: "pointer",
                bg: currentTab === index ? "primary" : "disabled",
                padding: "0.5rem",
                color: currentTab === index ? "white" : "textDefault",
                borderLeftRadius: index === 0 ? "4px" : "0",
                borderRightRadius: index === header.length - 1 ? "4px" : "0",
              })}
              onClick={() => {
                setCurrentTab(index);
              }}
            >
              {h}
            </div>
          );
        })}
      </div>
      <div className={bodyClassName} id="tab_body">
        {body[currentTab]}
      </div>
    </div>
  );
}
