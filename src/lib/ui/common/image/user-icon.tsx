import { User } from "@/domain/entity";
import { css } from "styled-system/css";

type Props = {
  // nullはユーザが画像を未設定の場合
  imageUrl: string | null;
  size: string;
};

export function UserIcon({ imageUrl, size }: Props) {
  return (
    <img
      width={size}
      className={css({
        borderRadius: "50%",
        aspectRatio: "1/1",
        objectFit: "cover",
      })}
      src={imageUrl ? imageUrl : User.defaultImageUrl}
      alt="user icon"
    />
  );
}

export function UserIconSquare({ imageUrl, size }: Props) {
  return (
    <img
      width={size}
      className={css({
        aspectRatio: "1/1",
        objectFit: "cover",
      })}
      src={imageUrl ? imageUrl : User.defaultImageUrl}
      alt="user icon"
    />
  );
}
