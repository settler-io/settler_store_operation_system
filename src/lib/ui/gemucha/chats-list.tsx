"use client";

import { useEffect } from "react";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";

type Props = {
  chatContents: Array<{
    id: string;
    version: number;
    sendUserId: string;
    receiveUserId: string;
    comment: string;
    sendAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }>;
  sessionUserId: string;
};

export function ChatsList(props: Props) {
  useEffect(() => {
    if (props.chatContents.length) {
      const lastChat = document.querySelector(`#chat-content-${props.chatContents.length - 1}`);
      lastChat?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [props.chatContents.length]);

  function isHost(hostId: string, sendUserId: string) {
    return hostId === sendUserId;
  }
  return (
    <div
      className={css({
        width: "100%",
        flex: 1,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        overflowY: "scroll",
        // overflowX: "hidden",
        position: "relative",
        marginBottom: "160px",
      })}
    >
      {props.chatContents.map((c, index) => {
        return (
          <div
            key={index}
            id={`chat-content-${index}`}
            className={css({
              maxW: "500px",
              padding: "8px",
              marginY: "8px",
              borderRadius: "8px",
              overflowWrap: "break-word",
            })}
            style={{
              alignSelf: isHost(c.sendUserId, props.sessionUserId) ? "flex-start" : "flex-end",
              backgroundColor: isHost(c.sendUserId, props.sessionUserId)
                ? token("colors.orange.600")
                : token("colors.gemcha"),
              color: isHost(c.sendUserId, props.sessionUserId) ? "white" : "black",
            }}
          >
            {c.comment}
          </div>
        );
      })}
    </div>
  );
}
