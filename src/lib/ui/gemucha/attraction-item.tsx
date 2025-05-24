import { PageUrl } from "@/application/url";
import type { ReactNode } from "react";
import { css } from "styled-system/css";
import { Padding, UserIcon } from "../common";
import { DotLine } from "./dot-line";

type Props = {
  imageUrl: string;
  name: string;
  date: ReactNode;
  desc: string;
  price: string;
  userId: string;
};

export function AttractionItem(props: Props) {
  return (
    <div
      className={css({
        display: "flex",
        width: "100%",
      })}
    >
      <div
        className={css({
          border: "solid 2px",
          borderColor: "gemcha",
          borderRadius: "32px",
          display: "flex",
          width: "100%",
          padding: "16px",
          fontFamily: "Murecho",
        })}
      >
        <a href={PageUrl.host.detail(props.userId)}>
          <UserIcon imageUrl={props.imageUrl} size="128px" />
        </a>
        <Padding size="16px" />
        <div
          className={css({
            display: "flex",
            flex: 1,
            flexDirection: "column",
          })}
        >
          <div
            className={css({
              display: "flex",
              width: "100%",
            })}
          >
            <div
              className={css({
                flex: 1,
              })}
            >
              {props.name}
            </div>
            {/* <div
              className={css({
                backgroundColor: "gemcha",
                color: "white",
                borderRadius: "8px",
                padding: "8px",
              })}
            > */}
            {/* TODO: action here */}
            {/* <a>もっとみる ▶︎</a>
            </div> */}
          </div>
          <div>{props.date}</div>
          <div
            className={css({
              paddingY: "8px",
            })}
          >
            <DotLine dotColor="orange" dotSize="8px" width="100%" />
          </div>
          <div>{props.desc}</div>
          <Padding size="16px" />
          <div
            className={css({
              width: "100%",
              textAlign: "end",
              color: "red",
            })}
          >
            <span
              className={css({
                fontSize: "20px",
              })}
            >
              {props.price}
            </span>
            <span>コイン/30分</span>
          </div>
        </div>
      </div>
    </div>
  );
}
