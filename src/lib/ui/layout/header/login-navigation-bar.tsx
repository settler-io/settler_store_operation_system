"use client";

import { PageUrl } from "@/application/url";
import { default as NextLink } from "next/link";
import { css } from "styled-system/css";
import { hstack } from "styled-system/patterns";

type Props = {
  welcome: string;
  mode?: string;
};

export function LoginNavigationBar(props: Props) {
  return (
    <>
      <div
        className={hstack({
          height: "48px",
          "@media screen and (max-width: 767px)": {
            maxHeight: "20px",
          },
          alignItems: "center",
          justifyContent: "center",
          padding: "0 4px",
          // gap: "12px",
          fontSize: "0.9em",
          fontFamily: "'Murecho'",
          width: "100%",
          flexWrap: "wrap",
        })}
      >
        <div
          className={hstack({
            "@media screen and (max-width: 767px)": {
              marginTop: "-0.5vh",
            },
          })}
          style={{ fontSize: "13px", wordBreak: "break-all", lineHeight: "1.2" }}
        >
          {props.welcome}
        </div>
        <div
          className={hstack({
            "@media screen and (max-width: 767px)": {
              marginTop: "-0.5vh",
            },
            "@media screen and (max-width: 280px)": {
              marginTop: "-2vh",
              fontSize: "12px",
            },
          })}
        >
          <span style={{ whiteSpace: "nowrap" }}>
            <NextLink href={PageUrl.auth.signupTop} className={css({ color: "info" })}>
              会員登録
            </NextLink>
          </span>
          <span style={{ whiteSpace: "nowrap" }}>
            <NextLink href={PageUrl.auth.signinTop} className={css({ color: "info" })}>
              ログイン
            </NextLink>
          </span>
        </div>
      </div>
    </>
  );
}
