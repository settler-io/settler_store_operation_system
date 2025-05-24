
import { PrismaClient } from "@prisma/client";
import { config } from "../../config";

export function getExternalApis() {
  const database = new PrismaClient({
    log: ["query"],
  });

  return {
    database,
  } as const;
}

export type ExternalApis = ReturnType<typeof getExternalApis>;
