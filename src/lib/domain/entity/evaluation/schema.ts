import { z } from "zod";
import { ID_SCHEMA, VERSION_SCHEMA } from "../common";

export const EVALUATION_SCHEMA = {
  id: ID_SCHEMA,
  version: VERSION_SCHEMA,
  reservationId: ID_SCHEMA,
  side: z.string(),
  evaluatedUserId: ID_SCHEMA,
  evaluateUserId: ID_SCHEMA,
  score: z.number(),
  comment: z.string().max(140),
  createdAt: z.date(),
  updatedAt: z.date(),
};
