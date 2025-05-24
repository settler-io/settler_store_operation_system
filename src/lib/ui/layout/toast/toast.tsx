"use client";

import { toast } from "react-toastify";

/**
 * ユーザに成功したことを通知するためのUI
 */
export function openSuccessToast(message: string) {
  toast(message);
}

/**
 * ユーザに失敗したことを通知するためのUI
 */
export function openErrorToast(message: string) {
  toast(message, { type: "error" });
}
