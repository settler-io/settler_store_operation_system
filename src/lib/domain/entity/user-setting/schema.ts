import { z } from "zod";
import { ID_SCHEMA, VERSION_SCHEMA } from "../common";

export const USER_SETTING_SCHEMA = {
  id: ID_SCHEMA,
  version: VERSION_SCHEMA,
  userId: ID_SCHEMA,
  price: z.number().int(),
  withFace: z.boolean(),
  imageUrl: z.string(),
  profile: z.string().max(1000),
  discordId: z.string(),
  isHost: z.boolean(),
  hostAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
};
