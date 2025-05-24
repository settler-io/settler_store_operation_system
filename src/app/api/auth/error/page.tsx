import { PageUrl } from "@/application/url";
import { redirect } from "next/navigation";

/**
 * NextAuthで予期しないサーバーエラーが発生した場合のページ
 * エラーがあった場合は、エラーメッセージを表示するページとして/auth/signinを使っているため、そちらにリダイレクトさせる
 */
export default function Page() {
  redirect(PageUrl.auth.signinTop + "?error=InternalServerError");
}
