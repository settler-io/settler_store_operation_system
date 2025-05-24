import { z } from "zod";
import { ID_SCHEMA, VERSION_SCHEMA } from "../common";

export const EMAIL_VERIFICATION_TOKEN_SCHEMA = {
  id: ID_SCHEMA,
  version: VERSION_SCHEMA,
  userId: ID_SCHEMA,
  email: z.string().email(),
  expiresAt: z.date(),
};
