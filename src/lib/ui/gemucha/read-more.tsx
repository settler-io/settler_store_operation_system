"use client";
import { useState, type ReactNode } from "react";
import { css } from "styled-system/css";
import { MainButton } from "../common";

type Props = {
  all: ReactNode;
  sample: ReactNode;
  hasMore: boolean;
};

export function ReadMore(props: Props) {
  const [all, setAll] = useState(false);
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
      })}
    >
      {all && props.all}
      {!all && props.sample}

      {props.hasMore && !all && (
        <MainButton
          style={{
            display: "flex",
            alignSelf: "center",
            marginTop: "8px",
          }}
          onClick={() => setAll(true)}
        >
          もっと見る
        </MainButton>
      )}
    </div>
  );
}
