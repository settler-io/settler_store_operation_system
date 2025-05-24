import { z } from "zod";

/**
 * このアプリで使うVersionの仕様
 * インクリメントされる整数。初期値は0
 *
 * @see https://github.com/paralleldrive/cuid2
 */
export const initialVersion = () => 0;

export const VERSION_SCHEMA = z.number().int().min(0);
