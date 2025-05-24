import { createServerAction } from "@/application/server-action";

/**
 * RootLayoutで使う共通データの取得処理
 *
 * - ログイン中のユーザIDの取得
 */
export const loadDataForRootLayout = createServerAction(
  async ({ sessionUserId }) => {
    return {
      sessionUserId,
    };
  },
  {
    name: "loadDataForRootLayout",
    auth: false,
    throw: true,
  },
);
