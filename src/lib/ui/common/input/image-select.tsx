"use client";

import { useCallback, useRef, type ComponentProps } from "react";
import { css } from "styled-system/css";

type Props = ComponentProps<"input"> & {
  label?: string;
};

export function ImageSelect({ label, ...props }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick = useCallback(() => inputRef.current?.click(), [inputRef]);

  return (
    <div>
      <input {...props} ref={inputRef} type="file" accept="image/*" tabIndex={-1} style={{ display: "none" }} />
      <button
        type="button"
        onClick={handleClick}
        className={css({
          fontSize: "12px",
          fontWeight: "700",
          color: "#6096e9",
          border: "1px solid #6096e9",
          borderRadius: "4px",
          padding: "6px",
          cursor: "pointer",
        })}
      >
        {label ? label : "画像を選択する"}
      </button>
    </div>
  );
}
