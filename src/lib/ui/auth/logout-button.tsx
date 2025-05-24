"use client";

import { PageUrl } from "@/application/url";
import { signOut } from "next-auth/react";
import { OutlineButton } from "../common";

export function LogoutButton() {
  return <OutlineButton onClick={logout} label="ログアウト" />;
}

function logout() {
  signOut({ redirect: false })
    .then(() => {
      window.location.assign(PageUrl.home);
    })
    .catch(console.error);
}
