import { renderHook } from "@testing-library/react";
import { useModal } from "./use-modal";

test("useModal", async () => {
  const { result } = renderHook(() => useModal());
  expect(result.current.openModal).toBeTypeOf("function");
  expect(result.current.closeModal).toBeTypeOf("function");
  expect(result.current.Modal).toBeTypeOf("function");
});
