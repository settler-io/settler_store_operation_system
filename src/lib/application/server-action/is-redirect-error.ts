const REDIRECT_ERROR_CODE = "NEXT_REDIRECT";

enum RedirectStatusCode {
  SeeOther = 303,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,
}

/**
 * next@14.2.0時点でisRedirectErrorがexportされていないため自前で実装している
 * next公式の実装を使うべきなので、exportされたらそちらに置き換える
 */
export function isRedirectError(error: unknown): error is RedirectError {
  if (typeof error !== "object" || error === null || !("digest" in error) || typeof error.digest !== "string") {
    return false;
  }

  const digest = error.digest.split(";");
  const [errorCode, type] = digest;
  const destination = digest.slice(2, -2).join(";");
  const status = digest.at(-2);

  const statusCode = Number(status);

  return (
    errorCode === REDIRECT_ERROR_CODE &&
    (type === "replace" || type === "push") &&
    typeof destination === "string" &&
    !isNaN(statusCode) &&
    statusCode in RedirectStatusCode
  );
}

// nextのコードから必要最小限の定義だけを抜き出した型
// こちらも公式を使うべき
export type RedirectError = Error & { digest: string };
