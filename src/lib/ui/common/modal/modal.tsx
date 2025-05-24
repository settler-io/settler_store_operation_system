"use client";

import { useCallback, useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { css } from "styled-system/css";
import { useMounted } from "./use-mounted";

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
  children?: ReactNode;
};

/**
 * アプリで使う共通のモーダル
 *
 * TODO: ブラウザサポートが充実してきたらdocument.startViewTransitionを使ってアニメーションを追加する
 */
export function Modal({ isOpen = false, onClose, children }: Props) {
  const mounted = useMounted();
  const ref = useRef<HTMLDialogElement>(null);

  // ダイアログ外のクリックでダイアログを閉じるための処理
  const handleClickDialogBackdrop = useCallback(() => {
    onClose?.();
    ref.current?.close();
  }, [onClose]);

  // ダイアログ内のクリックではダイアログを閉じなくするための処理
  const handleClickDialogContent = useCallback((e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (!mounted || !ref.current) {
      return;
    }

    if (isOpen) {
      if (!ref.current.open) {
        ref.current.showModal();
      }
    } else {
      if (ref.current.open) {
        ref.current?.close();
      }
    }
  }, [mounted, isOpen]);

  return mounted
    ? createPortal(
        <dialog
          ref={ref}
          className={css({
            width: "60dvw",
            height: "60dvh",
            position: "fixed",
            left: "50%",
            top: "46%",
            transform: "translate(-50%, -50%)",
            outline: "none",
            borderRadius: "8px",
            boxShadow: "rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px",
          })}
          onClick={handleClickDialogBackdrop}
        >
          <div
            className={css({
              width: "100%",
              height: "100%",
              padding: "8px",
              overflow: "auto",
            })}
            onClick={handleClickDialogContent}
          >
            {children}
          </div>
        </dialog>,
        window.document.body,
      )
    : null;
}
