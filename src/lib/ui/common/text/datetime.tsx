"use client";

import { format } from "date-fns";

/**
 * 日時のformatはtimezoneに依存するため、client側で行う
 */
export function DatetimeText({ time }: { time: number }) {
  return <span>{format(time, "yyyy年MM月dd日 HH:mm:ss")}</span>;
}
