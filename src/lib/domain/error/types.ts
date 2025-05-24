/**
 * 一般的に使われるResult型
 */
export type Result<R, E> = { result: R; error?: never } | { result?: never; error: E };
