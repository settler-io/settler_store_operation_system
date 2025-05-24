"use client";

import { format } from "date-fns/format";
import { ja } from "date-fns/locale/ja";
import type { ReactNode } from "react";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";
import { Padding, UserIconSquare } from "../common";
import { HLine } from "./h-line";

type Props = {
  host: boolean;
  imageUrl: string;
  name: string;
  from: Date;
  to: Date | null;
  prefixIcon: boolean;
  trail?: ReactNode;
  isSmall?: boolean;
};

export function HistoryItem(props: Props) {
  function renderHeader() {
    if (props.prefixIcon) {
      return (
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            // flexWrap: "wrap",
            // width: "140px",
            minW: "130px",
            padding: "6px 6px 6px 10px",
            flexDirection: "row",
            borderRadius: "10px",
            // textAlign:"center",
            // position:"relative",
            fontFamily: "Murecho",
          })}
          style={{
            backgroundColor: props.host ? "orange" : token("colors.gemcha"),
            marginLeft: props.isSmall ? "1vw" : "",
            // marginRight: props.isSmall ? "16px" : "",
          }}
        >
          <div
            className={css({
              // paddingX: "10px",
              whiteSpace: "nowrap",
              paddingRight: "10px",

              fontWeight: "bold",
              color: "white",
            })}
          >
            {props.host ? "ホスト" : "ゲスト"}
          </div>
          <div
            style={{
              // position:"absolute",
              // float: "right",

              backgroundColor: "white",
            }}
          >
            <UserIconSquare imageUrl={props.imageUrl} size="64px" />
          </div>
        </div>
      );
    }
    return (
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          width: "64px",
          padding: "2px",
        })}
        style={{
          marginLeft: props.isSmall ? "16px" : "",
          marginRight: props.isSmall ? "16px" : "",
        }}
      >
        <div>
          <UserIconSquare imageUrl={props.imageUrl} size="64px" />
        </div>
      </div>
    );
  }
  return (
    <div
      className={css({
        width: "100%",
      })}
    >
      <div
        className={css({
          display: "flex",
          flexDirection: "row",
          marginY: "16px",
        })}
      >
        {renderHeader()}

        <div
          className={css({
            marginLeft: "16px",
            width: "100%",
          })}
        >
          <div
            className={css({
              display: "flex",
              width: "100%",
              fontFamily: "Murecho",
              lg: {
                flexDirection: "row",
              },
              flexDirection: "column",
            })}
          >
            <div
              className={css({
                flex: 1,
              })}
            >
              {props.name}
            </div>
            <div
              style={{
                marginRight: props.isSmall ? "16px" : "",
              }}
            >
              {props.trail}
            </div>
          </div>
          <div style={{ fontFamily: "Murecho" }}>
            <Padding size="5px" />
            <div>
              {props.from && format(props.from, "yyyy-MM-dd HH:mm", { locale: ja })}
              {props.from && props.to && " ~ "}
              {props.to && format(props.to, "yyyy-MM-dd HH:mm", { locale: ja })}
            </div>
          </div>
        </div>
      </div>

      <HLine startColor={token("colors.gray.300")} endColor={token("colors.gray.300")} height="2px" />
    </div>
  );
}
