"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { css } from "styled-system/css";

type Props = ComponentPropsWithoutRef<"select"> & {
  label?: string;
  error?: string | undefined | false;
  options: {
    value: string;
    label: string;
  }[];
};

/**
 * 共通のSelectコンポーネント
 */
export const Select = forwardRef<HTMLSelectElement, Props>(({ label, error, options, ...props }, ref) => {
  return (
    <p className={css({ width: "100%" })}>
      {label && (
        <label htmlFor={label} className={css({ textStyle: "formLabel" })}>
          {label}
        </label>
      )}
      <select
        id={label}
        className={css({
          layerStyle: "formInput",
          background: "white",
        })}
        ref={ref}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className={css({ color: "error", textStyle: "formError" })}>{error}</span>}
    </p>
  );
});

Select.displayName = "Select";

export const SmallSelect = forwardRef<HTMLSelectElement, Props>(({ label, error, options, ...props }, ref) => {
  return (
    <p className={css({ width: "100%" })}>
      {label && (
        <label htmlFor={label} className={css({ textStyle: "formLabel", fontSize: "12px", marginRight: "8px" })}>
          {label}
        </label>
      )}
      <select
        id={label}
        className={css({
          layerStyle: "formSmallInput",
          background: "white",
        })}
        ref={ref}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className={css({ color: "error", textStyle: "formError" })}>{error}</span>}
    </p>
  );
});

SmallSelect.displayName = "SmallSelect";

export const SmallSelectTopPage = forwardRef<HTMLSelectElement, Props>(({ label, error, options, ...props }, ref) => {
  return (
    <p className={css({ width: "100%" })}>
      {label && (
        <label htmlFor={label} className={css({ textStyle: "formLabel", fontSize: "13px", marginRight: "8px" })}>
          {label}
        </label>
      )}
      <select
        id={label}
        className={css({
          layerStyle: "formSmallInputTop",
          background: "white",
        })}
        ref={ref}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className={css({ color: "error", textStyle: "formError" })}>{error}</span>}
    </p>
  );
});

SmallSelectTopPage.displayName = "SmallSelectTopPage";

/**
 * SelectDeckrecipeコンポーネント
 */
export const SelectDeckRecipe = forwardRef<HTMLSelectElement, Props>(({ label, error, options, ...props }, ref) => {
  return (
    <p className={css({ width: "100%" })}>
      {label && (
        <label htmlFor={label} className={css({ textStyle: "formLabel" })}>
          {label}
        </label>
      )}
      <select
        id={label}
        className={css({
          layerStyle: "formInputDeckRecipe",
          background: "white",
          fontWeight: "700",
          fontSize: "14px",
          backgroundImage: `url("/images/arrow.svg")`,
          backgroundPosition: "98% center",
          backgroundRepeat: "no-repeat",
        })}
        ref={ref}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className={css({ color: "error", textStyle: "formError" })}>{error}</span>}
    </p>
  );
});

SelectDeckRecipe.displayName = "SelectDeckRecipe";
