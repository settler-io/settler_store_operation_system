import { fireEvent, render, waitFor } from "@testing-library/react";
import { Tab } from "./tab";

test("Tab", async () => {
  // レンダリングでエラーがないことをテスト
  const header = ["tab 1", "tab 2"];
  const tabs = render(
    <Tab selected={0} header={header} body={[<div key={"1"}>tab 1</div>, <div key={"2"}>tab 2</div>]} />,
  );
  const tabHeaders = tabs.container.querySelectorAll(`[id^='tab_header_']`);
  tabHeaders.forEach((h, index) => {
    expect(h.textContent).toEqual(header[index]);
  });
  // selected=0なので、現在のテキストはtab 1
  const body = tabs.container.querySelector("#tab_body");
  expect(body?.textContent).toEqual("tab 1");
  const tab2 = tabs.container.querySelector("#tab_header_1") as Element;

  // タブを切り替える
  await waitFor(() => {
    fireEvent.click(tab2);
  });
  // テキストはtab 2に変わる
  const body2 = tabs.container.querySelector("#tab_body");
  expect(body2?.textContent).toEqual("tab 2");
});
