import { render } from "@testing-library/react";
import { UserIcon } from "./user-icon";

test("UserIcon", () => {
  // レンダリングでエラーがないことをテスト
  render(<UserIcon imageUrl="https://example.com/image.png" size="32px" />);
  // 一応nullは許容されているが期待された使い方ではない
  render(<UserIcon imageUrl={null} size="32px" />);
});
