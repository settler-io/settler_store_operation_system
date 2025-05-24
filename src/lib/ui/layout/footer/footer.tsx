"use client";

import { PageUrl } from "@/application/url";
import Link from "next/link";
import { css } from "styled-system/css";
import { hstack } from "styled-system/patterns";

type Props = {
  isDev: boolean;
};

export function Footer(props: Props) {
  return <TemporaryTermsLinkSection isDev={props.isDev} />;
}

function TemporaryTermsLinkSection({ isDev }: { isDev: boolean }) {
  const menuItems = [
    {
      title: "利用規約",
      path: PageUrl.docs.termsOfService,
    },
    {
      title: "プライバシーポリシー",
      path: PageUrl.docs.privacyPolicy,
    },
    {
      title: "特定商取引法に基づく表記",
      path: PageUrl.docs.tokushoho,
    },
    {
      title: "サポート・ガイド",
      path: PageUrl.support.zendesk,
    },
    {
      title: "運営会社",
      path: PageUrl.corporate.top,
    },
  ];

  return (
    <section className={css({ margin: "2em 0 30vh" })}>
      <h3
        className={css({
          color: "textLight",
          fontSize: "18px",
          padding: "0px 0 5px",
        })}
      >
        <Logo isDev={isDev} />
      </h3>
      <ul className={css({ display: "flex", fontSize: "0.8em", flexWrap: "wrap", justifyContent: "center" })}>
        {menuItems.map((i) => (
          <Link key={i.path} href={i.path} target="_blank">
            <li
              className={css({
                fontWeight: "600",
                padding: "6px 0 0 1em",
                borderBottom: "1px solid #e5e5e5",
                fontFamily: "'Murecho'",
              })}
            >
              {i.title}
              <div style={{ display: "inline-block", paddingLeft: "1em" }}> | </div>
            </li>
          </Link>
        ))}
      </ul>
    </section>
  );
}

function Logo({ isDev }: { isDev: boolean }) {
  return (
    <div
      className={hstack({
        gap: "2px",
        margin: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      })}
    >
      <img
        width="24px"
        src="/images/kaerulogo.svg"
        alt="カエルロゴ"
        style={isDev ? { filter: "hue-rotate(-170deg)" } : undefined}
      />

      <h2
        className={css({
          color: "#17293d",
          fontSize: "14.2px",
          fontWeight: "600",
          lineHeight: "56px",
          letterSpacing: "-0.26px",
          fontFamily: "'Murecho'",
          paddingLeft: "0.5em",
        })}
      >
        ゲムチャ
      </h2>
    </div>
  );
}
