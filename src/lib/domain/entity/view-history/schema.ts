import { z } from "zod";
import { ID_SCHEMA, VERSION_SCHEMA } from "../common";

export const VIEW_HISTORY_SCHEMA = {
  id: ID_SCHEMA,
  version: VERSION_SCHEMA,
  viewUserId: ID_SCHEMA,
  viewedUserId: ID_SCHEMA,
  viewAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
};
