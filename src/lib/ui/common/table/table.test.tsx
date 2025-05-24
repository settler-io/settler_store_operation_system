import { render } from "@testing-library/react";
import { HistoryTable } from "./table";

test("HistoryTable", () => {
  // レンダリングでエラーがないことだけをテスト
  render(
    <HistoryTable
      headers={[
        { id: "no", name: "No" },
        { id: "title", name: "title" },
      ]}
      data={[{ no: 1, title: "T1" }]}
    />,
  );
});
