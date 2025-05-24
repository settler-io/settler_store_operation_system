import { expect, test } from "@playwright/test";

test("top page", async ({ page }) => {
  // Next.jsのサーバーが起動できてトップページを表示できていること
  // TOPページで実行時エラーが発生していないこと
  const runtimeErrors: unknown[] = [];
  const client = await page.context().newCDPSession(page);
  await client.send("Runtime.enable");
  client.on("Runtime.exceptionThrown", (payload) => {
    runtimeErrors.push(payload.exceptionDetails.exception?.description || "no description");
  });

  await page.goto("/");

  // 実行時エラーが何もないこと
  expect(runtimeErrors).toStrictEqual([]);
});
