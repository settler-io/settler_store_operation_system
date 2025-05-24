import { setTimeout } from "timers/promises";
import { logger } from "./logger";

test("logger", async () => {
  expect(() => logger.info("message only")).not.toThrow();
  expect(() => logger.info("message with data", { a: "a", b: "b" })).not.toThrow();
  expect(() => logger.debug("debug")).not.toThrow();
  expect(() => logger.warn("warn")).not.toThrow();
  expect(() => logger.error("error", new Error("Something"))).not.toThrow();

  // pinoのログ出力は非同期なので
  await setTimeout(0);
});
