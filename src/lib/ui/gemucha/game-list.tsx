import { User, UserGame } from "@/domain/entity";
import { css } from "styled-system/css";
import { hstack } from "styled-system/patterns";
import { InputRadio, Padding, UserIcon } from "../common";

type Props = {
  games: Array<string>;
  onGameChanged: Function;
};

export function GamesList(props: Props) {
  return (
    <div className={hstack()}>
      {UserGame.games.map((g, index) => {
        return (
          <div
            key={index}
            className={css({
              minW: "120px",
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
            })}
          >
            <UserIcon imageUrl={UserGame.gameImg[g] || User.defaultImageUrl} size="64px" />
            <Padding size="8px" />
            <InputRadio
              type="checkbox"
              checked={!!props.games.find((s) => s === g)}
              label={g}
              onChange={(e) => {
                props.onGameChanged(g, e.target.checked);
              }}
              className={css({
                transform: "scale(1.5)",
              })}
            />
          </div>
        );
      })}
    </div>
  );
}
