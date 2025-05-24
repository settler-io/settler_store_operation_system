import { z } from "zod";
import { ID_SCHEMA, VERSION_SCHEMA } from "../common";

export const RESERVATION_SCHEMA = {
  id: ID_SCHEMA,
  version: VERSION_SCHEMA,
  hostUserId: ID_SCHEMA,
  guestUserId: ID_SCHEMA,
  startAt: z.date(),
  endAt: z.date(),
  price: z.number(),
  game: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
};
