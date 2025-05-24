import { render } from "@testing-library/react";
import { Calendar } from "./calendar";

test("Calendar", () => {
  // レンダリングでエラーがないことをテスト
  render(
    <Calendar
      reservations={[
        {
          title: "title",
          start: new Date("2024-04-08"),
          end: new Date("2024-04-10"),
          description: "desc",
        },
      ]}
    />,
  );
});
