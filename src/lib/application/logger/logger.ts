import pino from "pino";
import pretty from "pino-pretty";
import { serializeError } from "serialize-error";
import { config } from "../config";

class ApplicationLogger {
  readonly #logger: pino.Logger;

  constructor(logger: pino.Logger) {
    this.#logger = logger;
  }

  debug(message: string, data?: any): void {
    this.#log("debug", message, data);
  }

  info(message: string, data?: any): void {
    this.#log("info", message, data);
  }

  warn(message: string, data?: any): void {
    this.#log("warn", message, data);
  }

  error(message: string, data?: any): void {
    this.#log("error", message, serializeError(data));
  }

  // settlerのslackログ通知の仕様に合わせたログ出力
  // slackログ通知の仕様は以下を参照
  // https://github.com/settler-io/infra/blob/main/lib/lambda/cwlToSlack/index.py
  #log(level: "debug" | "info" | "warn" | "error", message: string, data?: any) {
    const LogLevel = level.toUpperCase();
    const Message = message;

    if (data) {
      this.#logger[level]({ LogLevel, Message, Data: data });
    } else {
      this.#logger[level]({ LogLevel, Message });
    }
  }
}

// Loggerはlocal環境、AWS dev環境、AWS prod環境でそれぞれ設定が異なる
function createUnderlyingLogger() {
  // Pinoの標準のログ形式を、このアプリに合わせて変更している
  const formatters = {
    // Pinoの標準はlevelを数値で出力する仕様
    // 人が見た時にlabelの方が分かりやすいためそちらに変更する
    // see https://github.com/pinojs/pino/blob/master/docs/api.md
    level(label: string) {
      return { level: label };
    },
    // Pinoは標準でpidとhostnameをログに出力する仕様
    // このアプリではhostnameは不要なので除外する
    bindings(bindings: pino.Bindings) {
      return { pid: bindings["pid"] };
    },
  };

  switch (true) {
    case config.isAwsProd: {
      return pino({ level: "info", formatters });
    }
    case config.isAwsDev: {
      return pino({ level: "debug", formatters });
    }
    default: {
      return pino({ level: "debug" }, pretty({ colorize: true }));
    }
  }
}

export const logger = new ApplicationLogger(createUnderlyingLogger());
