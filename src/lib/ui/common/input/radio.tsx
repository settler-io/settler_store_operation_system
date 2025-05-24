"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { css } from "styled-system/css";
import { hstack } from "styled-system/patterns";

export const InputRadio = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input"> & { label: string }>(
  ({ label, ...props }, ref) => {
    return (
      <p className={hstack({ width: "100%" })}>
        <input id={label} type="radio" className={css({})} {...props} ref={ref} />
        <label htmlFor={label} className={css({})}>
          {label}
        </label>
      </p>
    );
  },
);

InputRadio.displayName = "InputRadio";
