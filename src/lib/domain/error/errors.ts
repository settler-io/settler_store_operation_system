/**
 * このアプリケーションで使われるエラーのマスター定義
 */
export const ERRORS = {
  // 実行時に発生した想定外のエラー
  UnknownError: {
    displayMessage: "エラーが発生しました。時間をおいてから再度お試しください。",
  },
  MaxTorecaSizeExceeded: {
    displayMessage: "これ以上トレカを保有することができません。",
  },
  InvalidUserStatus: {
    displayMessage: "ユーザステータスが不正です。ログインし直してから再度お試しください。",
  },
  UserProfileIdAlreadyRegistered: {
    displayMessage: "指定のプロフィールIDは既に登録済みです。他のIDをお試しください。",
  },
} as const;

export type ErrorCode = keyof typeof ERRORS;
export type ErrorDetails = { code: ErrorCode } & (typeof ERRORS)[keyof typeof ERRORS];
