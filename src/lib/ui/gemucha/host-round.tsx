import { css } from "styled-system/css";

type Props = {
  url: string;
  imageUrl: string;
  name: string;
  online?: boolean;
};

export function HostRound(props: Props) {
  return (
    <div
      className={css({
        marginBottom: "16px",
        height: "14vw",
        width: "12vw",
        minHeight: "104px",
        minWidth: "87px",
        maxHeight: "164px",
        maxWidth: "140px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
      })}
    >
      <a
        href={props.url}
        className={css({
          minHeight: "75px",
          minWidth: "75px",
          maxHeight: "125px",
          maxWidth: "125px",
          height: "11vw",
          width: "11vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        })}
      >
        <img
          className={css({
            width: "100%",
            height: "100%",
            objectFit: "cover",
            backgroundSize: "cover",
            backgroundPosition: "50%",
            borderRadius: "50%",
          })}
          style={props.online ? { border: "2px solid #ed93e3" } : {}}
          src={props.imageUrl}
          alt="host-round-img"
        />
      </a>
      <div
        className={css({
          paddingTop: "6px",
          textAlign: "center",
          width: "8vw",
          fontWeight: "700",
          fontSize: "clamp(12px,1.1vw,14px)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: "70px",
          maxWidth: "130px",
        })}
      >
        {props.name}
      </div>
    </div>
  );
}
