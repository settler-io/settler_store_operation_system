"use client";

import { useEffect, useState } from "react";

import { getChat } from "../../../app/mypage/chat/action";
import { ChatsList } from "./chats-list";

type Props = {
  targetId: string;
  sessionUserId: string;
};

const useIdle = (startTime: number) => {
  const [timer, setTimer] = useState(startTime);
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      }
    }, 1000);
    const resetTimeout = () => {
      setTimer(startTime);
    };
    const events = ["load", "mousemove", "mousedown", "click", "scroll", "keypress"];
    for (let i in events) {
      window.addEventListener(events[i] || "", resetTimeout);
    }
    return () => {
      clearInterval(interval);
      for (let i in events) {
        window.removeEventListener(events[i] || "", resetTimeout);
      }
    };
  });
  return timer;
};

export function ChatsListWrapper(props: Props) {
  const [chatContents, setChatContents] = useState(
    [] as Array<{
      id: string;
      version: number;
      sendUserId: string;
      receiveUserId: string;
      comment: string;
      sendAt: Date;
      createdAt: Date;
      updatedAt: Date;
    }>,
  );
  const idle = useIdle(30);
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    getChat(props.sessionUserId, props.targetId)
      .then((chats) => setChatContents(chats))
      .catch((e) => console.log(e));
  }, []);
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    // Fetch data every 30s
    const interval = setInterval(() => {
      // If the user has been active in 30s
      if (idle > 0) {
        getChat(props.sessionUserId, props.targetId)
          .then((chats) => setChatContents(chats))
          .catch((e) => console.log(e));
      }
    }, 30000);
    return () => {
      clearInterval(interval);
    };
  }, [props.sessionUserId, props.targetId]);

  return <ChatsList chatContents={chatContents} sessionUserId={props.sessionUserId} />;
}
