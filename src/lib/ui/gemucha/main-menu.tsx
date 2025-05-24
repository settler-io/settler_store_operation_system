"use client";

import { PageUrl } from "@/application/url";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { css } from "styled-system/css";
import { MY_PAGE_MENUS } from "./my-page-menu";

export function MainMenu() {
  const [currentPage, setCurrentPage] = useState("/");
  const pathname = usePathname();
  const menus = [{ title: "マイページ", url: PageUrl.mypage.top }, ...MY_PAGE_MENUS];
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const current = menus.find((m) => isCurrentPage(pathname, m.url));
    setCurrentPage(current?.url || "/");
  }, [pathname]);
  function isCurrentPage(currentUrl: string, compareUrl: string) {
    if (currentUrl === "/") {
      return false;
    }
    if (compareUrl === PageUrl.mypage.top) {
      return compareUrl === currentUrl;
    }
    return currentUrl && currentUrl.includes(compareUrl);
  }
  return (
    <div
      className={css({
        width: "100%",
        backgroundColor: "#DCF9FF",
        display: "flex",
        gap: "0em 2em",
        alignItems: "center",
        lg: {
          justifyContent: "center",
        },
        justifyContent: "center",
        overflow: "auto",
        fontWeight: "900",
        fontFamily: "Murecho",
        letterSpacing: "0.1em",
        flexWrap: "wrap",
        "@media screen and (max-width: 550px)": {
          padding: "0.5em 0",
        },
      })}
    >
      {menus.map((m, index) => (
        <a
          href={m.url}
          key={index}
          style={{
            color: currentPage === m.url ? "#FF7A00" : "",
          }}
          className={css({
            whiteSpace: "nowrap",
            paddingTop: "clamp(4px,1vw,15px)",
            paddingBottom: "clamp(4px,1vw,15px)",
            fontSize: "16px",
            // fontSize: "clamp(15px,1em,16px)",
          })}
        >
          {m.title}
        </a>
      ))}
    </div>
  );
}
