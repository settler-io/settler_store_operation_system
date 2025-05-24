import { MY_PAGE_MENUS } from "./my-page-menu";

test("MenuItem", () => {
  expect(MY_PAGE_MENUS.at(0)?.title).toBe("足跡");
});
