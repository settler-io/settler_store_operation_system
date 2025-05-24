"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { css } from "styled-system/css";

export const Input = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<"input"> & { label?: string; error?: string | undefined | false }
>(({ label, error, ...props }, ref) => {
  return (
    <p className={css({ width: "100%" })}>
      {label && (
        <label htmlFor={label} className={css({ textStyle: "formLabel" })}>
          {label}
        </label>
      )}
      <input id={label} className={css({ layerStyle: "formInput" })} ref={ref} {...props} />
      {error && <span className={css({ color: "error", textStyle: "formError" })}>{error}</span>}
    </p>
  );
});

Input.displayName = "Input";

export const SmallInput = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<"input"> & { label?: string; error?: string | undefined | false }
>(({ label, error, ...props }, ref) => {
  return (
    <p className={css({ width: "100%" })}>
      {label && (
        <label htmlFor={label} className={css({ textStyle: "formLabel" })}>
          {label}
        </label>
      )}
      <input id={label} className={css({ layerStyle: "formSmallInput" })} ref={ref} {...props} />
      {error && <span className={css({ color: "error", textStyle: "formError" })}>{error}</span>}
    </p>
  );
});

SmallInput.displayName = "SmallInput";

export const InputDeckRecipe = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<"input"> & { label?: string; error?: string | undefined | false }
>(({ label, error, ...props }, ref) => {
  return (
    <p className={css({ width: "100%" })}>
      {label && (
        <label htmlFor={label} className={css({ textStyle: "formLabel" })}>
          {label}
        </label>
      )}
      <input id={label} className={css({ layerStyle: "formInputDeckRecipe" })} ref={ref} {...props} />
      {error && <span className={css({ color: "error", textStyle: "formError" })}>{error}</span>}
    </p>
  );
});

InputDeckRecipe.displayName = "InputDeckRecipe";
