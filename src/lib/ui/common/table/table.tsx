"use client";

import { css } from "styled-system/css";

import type { ReactNode } from "react";

type HeaderProps = Array<{ id: string; name: string }>;

type TableProps = Array<{
  [key: string]: string | number | ReactNode;
}>;

type Props = {
  headers: HeaderProps;
  data: TableProps;
};

export function HistoryTable(props: Props) {
  return (
    <table className={css({ w: "100%" })}>
      <thead>
        <tr className={css({ bg: "gray.100" })}>
          {props.headers.map((h) => {
            return (
              <th key={h.id} className={css({ textAlign: "left", padding: "8px" })}>
                {h.name}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {props.data.map((item, index) => {
          return (
            <tr
              key={index}
              className={css({
                _even: { bg: "gray.100" },
                _odd: { bg: "white" },
              })}
            >
              {props.headers.map((h) => {
                return (
                  <td key={h.id} className={css({ padding: "8px" })}>
                    {item[h.id]}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
