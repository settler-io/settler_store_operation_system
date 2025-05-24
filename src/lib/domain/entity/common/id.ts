import { init } from "@paralleldrive/cuid2";
import { z } from "zod";

/**
 * このアプリで使うIDの仕様
 * cuidの16文字
 *
 * @see https://github.com/paralleldrive/cuid2
 */
export const createId = init({
  length: 16,
});

export const ID_SCHEMA = z.string().length(16);
