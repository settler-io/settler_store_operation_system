"use client";

import { useEffect } from "react";

type Props = {
  viewUserId: string;
  viewedUserId: string;
  saveFootPrint: Function;
};

export function FootPrint(props: Props) {
  useEffect(() => {
    props.saveFootPrint(props.viewUserId, props.viewedUserId);
  });
  return <div></div>;
}
