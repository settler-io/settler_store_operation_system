"use client";

import { useEffect, useState } from "react";

/**
 * next@13.5.3 現在、ssr時にwindowオブジェクトのアクセスでエラーが出てしまうための対応
 * https://stackoverflow.com/questions/76268977/how-to-create-a-portal-modal-in-next-13-4
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), [setMounted]);

  return mounted;
}
