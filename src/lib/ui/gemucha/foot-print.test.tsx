import { act, render } from "@testing-library/react";
import { FootPrint } from "./foot-print";

test("FootPrint", async () => {
  // レンダリングでエラーがないことをテスト
  await act(async () =>
    render(<FootPrint viewUserId="viewUserId" viewedUserId="viewedUserId" saveFootPrint={vi.fn()} />),
  );
});
