import { config } from "@/application/config";
import { MainMenu } from "@/ui/gemucha";
import { Footer, GoogleTagManagerScript, Header, ToastContainerProvider } from "@/ui/layout";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "react-toastify/dist/ReactToastify.min.css";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";
import { loadDataForRootLayout } from "./action";
import "./globals.css";

// このアプリではNext.jsで事前ビルドをしない
// ユーザ認証が前提であり、全画面をユーザ情報に基づいてSSRするため
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ゲムチャ",
  description: "",
  metadataBase: new URL(config.origin + "/"),
};

/* eslint-disable @next/next/no-page-custom-font */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const isDev = !config.isAwsProd;
  const { result: data } = await loadDataForRootLayout();

  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        {/* <link href="https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=M+PLUS+1p:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"/> */}

        <link
          href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap"
          rel="stylesheet"
        ></link>
      </head>

      <body
        className={css({
          minHeight: "100dvh",
          background: "#e7e9ed",
          textStyle: "base",
          color: "textDefault",
          WebkitTapHighlightColor: "transparent",
          // fontFamily: "'M PLUS 1p'",
        })}
      >
        <GoogleTagManagerScript gtmId={config.googleTagManagerId} userId={data.sessionUserId} />
        <ToastContainerProvider />
          <div
            className={flex({
              flexDirection: "column",
              margin: "auto",
              width: "100%",
              paddingBottom: "10vh",
              // minHeight: "100dvh",
              background: "#ffffff",
              position: "relative",
            })}
          >
            <Header isDev={isDev} />
            <MainMenu />
            <main
              className={css({
                flex: "1",
                background: "#ffffff",
              })}
            >
              {children}
            </main>
          </div>
          <Footer isDev={isDev} />
      </body>
    </html>
  );
}
