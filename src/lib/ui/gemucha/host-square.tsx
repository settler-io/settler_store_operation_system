import { css } from "styled-system/css";

type Props = {
  url: string;
  imageUrl: string;
  name: string;
  coin: number;
};

export function HostSquare(props: Props) {
  return (
    <div
      className={css({
        position: "relative",
        width: "25%",
        padding: "8px",
      })}
    >
      <a
        href={props.url}
        className={css({
          fontFamily: "NicoKaku-v2",
          fontOpticalSizing: "auto",
          width: "100%",
          backgroundColor: "#eee",
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          overflow: "hidden",
          border: "3px solid rgba(161, 67, 255, 0.97)",
        })}
      >
        <div
          className={css({
            maxWidth: "100%",
            overflow: "hidden",
            backgroundColor: "#eee",
            position: "relative",
          })}
        >
          <img
            className={css({
              width: "100%",
              height: "100%",
              objectFit: "cover",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderTopRadius: "8px",
              aspectRatio: "1/1",
            })}
            src={props.imageUrl}
            alt="host-square-img"
          />
        </div>

        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            flex: "1",
            padding: "12px 8px",
            backgroundColor: "#f8f8f8",
            borderBottomRadius: "8px",
          })}
        >
          <p
            className={css({
              lineHeight: 1,
              fontWeight: 600,
              marginBottom: "6px",
              fontSize: "16px",
            })}
          >
            {props.name}
          </p>
          <span className={css({})}>
            <span
              className={css({
                color: "#FF3654",
                fontWeight: 600,
                fontSize: "18px",
              })}
            >
              {props.coin}
            </span>
            <span
              className={css({
                color: "#FF3654",
                fontWeight: 600,
                fontSize: "12px",
              })}
            >
              {" "}
              コイン/ 30分
            </span>
          </span>
        </div>
      </a>
    </div>
  );
}
