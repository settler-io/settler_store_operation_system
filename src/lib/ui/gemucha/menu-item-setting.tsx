import type { ReactNode } from "react";
import { css } from "styled-system/css";
import DotsIcon from "./icons/dots-icon";

type Props = {
  // url: string;
  title: ReactNode;
  isHeader?: boolean;
};

export function MenuItemSetting(props: Props) {
  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingBottom: "10px",
      })}
    >
      <DotsIcon />
      <div
        className={css({
          fontWeight: "bold",
        })}
        style={{
          fontSize: "18px",
        }}
      >
        {props.title}
      </div>
    </div>
  );
}
