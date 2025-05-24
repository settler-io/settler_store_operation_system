import { z } from "zod";
import { ID_SCHEMA, VERSION_SCHEMA } from "../common";

export const GAMES = ["その他"];

export const GAME_IMG = {
  その他: "https://d2zsxcb1sxm997.cloudfront.net/uploads/game/image/16/avatar_683ff244-8f20-4a00-811c-782c20b4da8d.png",
} as { [key: string]: string };

export const USER_GAME_SCHEMA = {
  id: ID_SCHEMA,
  version: VERSION_SCHEMA,
  userId: ID_SCHEMA,
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
};
