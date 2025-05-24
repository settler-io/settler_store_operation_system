import { render } from "@testing-library/react";
import { PageTitle } from "./page-title";

test("PageTitle", () => {
  // レンダリングでエラーがないことをテスト
  render(<PageTitle text="title" />);
});
