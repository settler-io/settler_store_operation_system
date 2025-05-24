import { z } from "zod";
import { ID_SCHEMA, VERSION_SCHEMA } from "../common";

export const CHAT_SCHEMA = {
  id: ID_SCHEMA,
  version: VERSION_SCHEMA,
  sendUserId: ID_SCHEMA,
  receiveUserId: ID_SCHEMA,
  comment: z.string().min(1).max(300),
  sendAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
};
