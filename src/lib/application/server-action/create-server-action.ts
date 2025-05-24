import { getServerContext, type ServerContext } from "@/application/context";
import { logger } from "@/application/logger";
import { PageUrl } from "@/application/url";
import type { User } from "@/domain/entity";
import { toErrorDetails, type ErrorDetails, type Result } from "@/domain/error";
import { redirect } from "next/navigation";
import { isRedirectError, type RedirectError } from "./is-redirect-error";

type Options = {
  name: string;
  redirectOnSuccess?: string;
  redirectOnError?: string;
  useTransaction?: boolean;
  auth?: boolean;
  throw?: boolean;
};

/**
 * ServerActionはthrowしたErrorをクライアント側に返すことができない仕様のため、Result型を使ってerrorを表現している
 */
export type ServerAction<Input = undefined, Output = unknown> = Input extends undefined
  ? () => Promise<Result<Output, ErrorDetails>>
  : (i: Input) => Promise<Result<Output, ErrorDetails>>;

type ServerActionWithThrow<Input = undefined, Output = unknown> = Input extends undefined
  ? () => Promise<Result<Output, ErrorDetails> & { result: Output; error?: never }>
  : (i: Input) => Promise<Result<Output, ErrorDetails> & { result: Output; error?: never }>;

export type ServerActionContext = Omit<ServerContext, "$transaction"> & { sessionUser: User | null };

/**
 * このアプリで使われるNext.js Server Actionsの共通処理をまとめた処理
 *
 * アプリのServer Actionの処理で共通で使われているDI用のコンテキスト取得や、ログ出力処理を共通化している
 * また、Next.jsのredirect関数がthrowを利用していて、アプリで例外処理をする際にredirectがtry/catchに入らないように入れ子構造にする必要があり、
 * これがコードの見通しを悪くしているため、その処理も見通し良く書けるようにする目的もある。
 */
export function createServerAction<
  Task extends (ctx: ServerActionContext & { sessionUser: User }, data?: any) => Promise<any>,
  Data = Parameters<Task>[1],
  Result = Awaited<ReturnType<Task>>,
>(task: Task, options: Options & { auth: true; throw?: false }): ServerAction<Data, Result>;
export function createServerAction<
  Task extends (ctx: ServerActionContext & { sessionUser: User }, data?: any) => Promise<any>,
  Data = Parameters<Task>[1],
  Result = Awaited<ReturnType<Task>>,
>(task: Task, options: Options & { auth: true; throw: true }): ServerActionWithThrow<Data, Result>;
export function createServerAction<
  Task extends (ctx: ServerActionContext, data?: any) => Promise<any>,
  Data = Parameters<Task>[1],
  Result = Awaited<ReturnType<Task>>,
>(task: Task, options: Options & { auth: false; throw?: false }): ServerAction<Data, Result>;
export function createServerAction<
  Task extends (ctx: ServerActionContext, data?: any) => Promise<any>,
  Data = Parameters<Task>[1],
  Result = Awaited<ReturnType<Task>>,
>(task: Task, options: Options & { auth: false; throw: true }): ServerActionWithThrow<Data, Result>;
export function createServerAction<
  Task extends (ctx: ServerActionContext, data?: any) => Promise<any>,
  Data = Parameters<Task>[1],
  Result = Awaited<ReturnType<Task>>,
>(task: Task, options: Options): ServerAction<Data, Result> | ServerActionWithThrow<Data, Result> {
  return (async (data?: Data) => {
    try {
      logger.debug(`Start action "${options.name}"`);

      const ctx = await getServerContext();

      // auth=trueの場合はsessionの認証をする
      // auth=falseの場合は認証せず、sessionUser=nullが使われる
      let sessionUser: User | null = null;
      if (options.auth) {
        if (!ctx.sessionUserId) {
          redirect(PageUrl.auth.signinTop);
        }

        // JWTのuserIdから検索するため、ここでユーザが見つからないことは通常ありえない
        // 開発時にデータベースを初期化した場合や、ユーザを手動削除した場合はnullになり得る
        // ここでエラーになるとログアウトすら出来なくなってしまうため、一応エラー処理をしておく
        sessionUser = await ctx.userRepository.find(ctx.sessionUserId).catch(() => null);
        if (!sessionUser) {
          logger.error(`Error user not found "${options.name}"`);
          redirect(PageUrl.auth.signinTop);
        }
      }

      // nextのRedirectErrorに対しての特別なエラー処理
      // nextのredirect関数はRedirectErrorをthrowしているが、
      // アプリケーションの処理としてredirectを実行することは正常な処理であって、これでtransaction内で使われることがある
      // transaction内でredirectをした場合、何もケアしないとthrow Errorであるためtransactionが失敗してロールバックされてしまう
      // ロールバックを防ぐために、以下で特別なエラー処理をしてthrowのタイミングをtransaction完了後に変えている
      let result: Result | null = null;
      let redirectError: RedirectError | null = null;
      const onSuccess = (r: Result) => {
        result = r;
      };
      const onError = (e: unknown) => {
        if (isRedirectError(e)) {
          redirectError = e;
        } else {
          throw e;
        }
      };
      if (options.useTransaction) {
        await ctx.$transaction(async (deps) => {
          await task({ ...deps, sessionUserId: ctx.sessionUserId, sessionUser }, data)
            .then(onSuccess)
            .catch(onError);
        });
      } else {
        await task({ ...ctx, sessionUser }, data)
          .then(onSuccess)
          .catch(onError);
      }

      logger.debug(`End action "${options.name}"`, result);

      // ここでRedirectErrorをthrowしているのは、上で説明した通り
      // transaction内でthrowするとロールバックしてしまうため、transaction完了後にthrowしている
      if (isRedirectError(redirectError)) {
        throw redirectError;
      }

      // redirectの指定があれば処理完了時にredirectする
      // redirectは実行時にthrowするため、try句の中に書いてはダメ
      if (options.redirectOnSuccess) {
        redirect(options.redirectOnSuccess);
      }

      return { result };
    } catch (e) {
      // RedirectErrorの場合は正常系のため、エラーとして扱わずそのまま上層にthrowする
      if (isRedirectError(e)) {
        throw e;
      }

      logger.error(`Error action "${options.name}"`, e);

      // redirectの指定があればエラー時にredirectする
      if (options.redirectOnError) {
        redirect(options.redirectOnError);
      }

      if (options.throw) {
        throw e;
      } else {
        return { error: toErrorDetails(e) };
      }
    }
  }) as ServerAction<Data, Result> | ServerActionWithThrow<Data, Result>;
}
