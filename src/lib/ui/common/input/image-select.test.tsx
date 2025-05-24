import { render } from "@testing-library/react";
import { ImageSelect } from "./image-select";

test("ImageSelect", () => {
  // レンダリングでエラーがないことをテスト
  render(<ImageSelect />);
});
