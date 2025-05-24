import { PageUrl } from "@/application/url";
import Link from "next/link";
import { css } from "styled-system/css";

export function TermsAgreementText() {
  return (
    <p className={css({ color: "textLight", textStyle: "termsNavigation" })}>
      <Link href={PageUrl.docs.termsOfService} className={css({ color: "info" })}>
        利用規約
      </Link>
      及び
      <Link href={PageUrl.docs.termsOfService} className={css({ color: "info" })}>
        プライバシーポリシー
      </Link>
      に同意の上、登録又はログインへお進みください。
    </p>
  );
}
