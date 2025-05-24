import { getErrorDetails, type ErrorDetails, type Result } from "@/domain/error";
import { openErrorToast, openSuccessToast } from "@/ui/layout";

/**
 * このアプリのUI側でServer Actionsを扱うための共通処理
 * 通知周りの実装も共通化している
 */
export async function handleServerAction<R>(
  response: Promise<Result<R, ErrorDetails>>,
  options: {
    successToastMessage?: string;
    onSuccess?: (result: R) => void | Promise<void>;
    onError?: (error: ErrorDetails) => void | Promise<void>;
  } = {},
): Promise<void> {
  let result: R | undefined;
  let error: ErrorDetails | undefined;

  try {
    const res = await response;
    // ServerActionがredirectなどで終了した場合はundefinedになる
    if (res) {
      if (res.error) {
        error = res.error;
      } else {
        result = res.result;
      }
    }
  } catch (e) {
    // ネットワークエラーなどの実行時エラーも対応するため、リクエストのpromiseをcatchして、共通のエラー型を返すようにする処理
    error = getErrorDetails("UnknownError");
  }

  if (error) {
    openErrorToast(error.displayMessage);
    await options.onError?.(error);
  } else {
    if (options.successToastMessage) {
      openSuccessToast(options.successToastMessage);
    }
    await options.onSuccess?.(result!);
  }
}
