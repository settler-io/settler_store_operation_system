import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Tabs } from "./tabs";

test("Tabs", () => {
  // レンダリングでエラーがないことをテスト
  render(
    <Tabs
      headers={[<div key={"1"}>h1</div>, <div key={"2"}>h2</div>]}
      bodies={[<div key={"3"}>b1</div>, <div key={"4"}>b2</div>]}
    />,
  );
  expect(screen.getByText("h1")).toBeDefined();
  expect(screen.getByText("b1")).toBeDefined();
  const h1 = screen.getByText("h1");
  const h2 = screen.getByText("h2");
  waitFor(() => {
    fireEvent.click(h2);
  });
  expect(screen.queryByText("b1")).toBeNull();
  expect(screen.getByText("b2")).toBeDefined();
  waitFor(() => {
    fireEvent.click(h1);
  });
  expect(screen.queryByText("b2")).toBeNull();
  expect(screen.getByText("b1")).toBeDefined();
});
