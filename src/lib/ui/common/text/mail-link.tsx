import { css } from "styled-system/css";

type Props = {
  email: string;
};

export function MailLink(props: Props) {
  return (
    <a
      href={`mailto:${props.email}`}
      className={css({
        color: "#407bd9",
      })}
    >
      {props.email}
    </a>
  );
}
