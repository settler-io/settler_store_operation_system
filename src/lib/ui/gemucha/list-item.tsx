import type { ReactNode } from "react";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";
import { Padding } from "../common";

type Props = {
  icon: ReactNode;
  title: ReactNode;
  subTitle: ReactNode;
  desc: string;
  right: ReactNode;
  selected?: boolean;
};

export function ListItem(props: Props) {
  return (
    <div
      className={css({
        display: "flex",
        lg: {
          flexDirection: "row",
        },
        flexDirection: "column",
        padding: "8px 8px 8px 0",
        // borderBottom: "2px #ddd solid",
        // borderBottom: "dotted 8px #99e6ff",
        // direction: "ltr",
      })}
      style={{
        backgroundColor: props.selected ? token("colors.gemcha") : "",
      }}
    >
      <div
        className={css({
          padding: "8px 8px 0 8px",
        })}
      >
        {props.icon}
      </div>
      <div
        className={css({
          flex: 1,
        })}
      >
        <div
          className={css({
            display: "flex",
            width: "100%",
            flexDirection: "column",
          })}
        >
          <div
            className={css({
              display: "flex",
              width: "100%",
              lg: {
                flexDirection: "row",
              },
              flexDirection: "column",
            })}
          >
            <div
              className={css({
                // fontWeight: "bold",
              })}
            >
              {props.title}
            </div>
            <div
              className={css({
                minW: "50px",
                alignSelf: "flex-end",
                flex: 1,
                textAlign: "end",
              })}
            >
              {props.right}
            </div>
          </div>
          {props.subTitle && <div>{props.subTitle}</div>}
        </div>
        <Padding size="8px" />
        <div>{props.desc}</div>
      </div>
    </div>
  );
}

export function ListItemChat(props: Props) {
  return (
    <div
      className={css({
        display: "flex",
        lg: {
          flexDirection: "row",
        },
        flexDirection: "column",
        padding: "8px 8px 8px 0",
        // borderBottom: "2px #ddd solid",
        borderBottom: "dotted 8px #99e6ff",
        direction: "ltr",
      })}
      style={{
        backgroundColor: props.selected ? token("colors.gemcha") : "",
      }}
    >
      <div
        className={css({
          padding: "8px 8px 0 8px",
        })}
      >
        {props.icon}
      </div>
      <div
        className={css({
          flex: 1,
        })}
      >
        <div
          className={css({
            display: "flex",
            width: "100%",
            flexDirection: "column",
          })}
        >
          <div
            className={css({
              display: "flex",
              width: "100%",
              lg: {
                flexDirection: "row",
              },
              flexDirection: "column",
            })}
          >
            <div
              className={css({
                // fontWeight: "bold",
              })}
            >
              {props.title}
            </div>
            <div
              className={css({
                minW: "50px",
                alignSelf: "flex-end",
                flex: 1,
                textAlign: "end",
              })}
            >
              {props.right}
            </div>
          </div>
          {props.subTitle && <div>{props.subTitle}</div>}
        </div>
        <Padding size="8px" />
        <div>{props.desc}</div>
      </div>
    </div>
  );
}
