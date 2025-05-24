import { doMockCreateServerAction } from "@/application/server-action/testing";

describe("getSessionUserOrRedirect", () => {
  const sessionUser = { id: "userId1234567890" };
  doMockCreateServerAction({ sessionUser });

  test("sessionUserを返す", async () => {
    const { getSessionUserOrRedirect } = await import("./get-session-user");
    const result = await getSessionUserOrRedirect();

    expect(result).toBe(sessionUser);
  });
});
