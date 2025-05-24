import { z } from "zod";
import { ID_SCHEMA, VERSION_SCHEMA } from "../common";

export const HOST_IMAGE_SCHEMA = {
  id: ID_SCHEMA,
  version: VERSION_SCHEMA,
  userId: ID_SCHEMA,
  imageUrl: z.string().url(),
  createdAt: z.date(),
  updatedAt: z.date(),
};
