import { z } from "zod";
import { ID_SCHEMA, VERSION_SCHEMA } from "../common";

export const ATTRACTION_SCHEMA = {
  id: ID_SCHEMA,
  version: VERSION_SCHEMA,
  userId: ID_SCHEMA,
  message: z.string().max(140),
  startAt: z.date(),
  endAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
};
