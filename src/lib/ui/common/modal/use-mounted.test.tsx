import { renderHook } from "@testing-library/react";
import { useMounted } from "./use-mounted";

test("useMounted", async () => {
  const { result } = renderHook(() => useMounted());
  expect(result.current).toBe(true);
});
