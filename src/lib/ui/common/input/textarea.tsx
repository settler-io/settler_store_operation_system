"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { css } from "styled-system/css";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<"textarea"> & { label?: string; error?: string | undefined | false }
>(({ label, error, ...props }, ref) => {
  return (
    <p className={css({ width: "100%" })}>
      {label && (
        <label htmlFor={label} className={css({ textStyle: "formLabel" })}>
          {label}
        </label>
      )}
      <textarea
        id={label}
        className={css({
          layerStyle: "formInput",
          padding: "8px",
          minHeight: "120px",
        })}
        ref={ref}
        {...props}
      />
      {error && <span className={css({ color: "error", textStyle: "formError" })}>{error}</span>}
    </p>
  );
});

Textarea.displayName = "Textarea";

export const TextareaDeckRecipe = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<"textarea"> & { label?: string; error?: string | undefined | false }
>(({ label, error, ...props }, ref) => {
  return (
    <p className={css({ width: "100%" })}>
      {label && (
        <label htmlFor={label} className={css({ textStyle: "formLabel" })}>
          {label}
        </label>
      )}
      <textarea
        id={label}
        className={css({
          layerStyle: "formInputDeckRecipe",
          padding: "8px",
          minHeight: "120px",
        })}
        ref={ref}
        {...props}
      />
      {error && <span className={css({ color: "error", textStyle: "formError" })}>{error}</span>}
    </p>
  );
});

TextareaDeckRecipe.displayName = "TextareaDeckRecipe";
