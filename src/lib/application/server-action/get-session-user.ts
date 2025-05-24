import { createServerAction } from "@/application/server-action";
import { PageUrl } from "@/application/url";

const _getSessionUserOrRedirect = createServerAction(async ({ sessionUser }) => sessionUser, {
  name: "getSessionUserOrRedirect",
  auth: true,
  throw: true,
  redirectOnError: PageUrl.auth.signinTop,
});

/**
 * 各page.tsxでユーザー情報を取得する際に使う共通処理
 * ユーザがログインしていなかった場合はリダイレクトする
 */
export async function getSessionUserOrRedirect() {
  const { result } = await _getSessionUserOrRedirect();
  return result;
}
