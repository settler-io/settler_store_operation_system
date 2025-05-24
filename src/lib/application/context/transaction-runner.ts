import { getDomainServices, type Dependencies } from "./dependency";
import { getQueries } from "./dependency/queries";
import { getRepositories } from "./dependency/repositories";

export type TransactionRunner = <Result>(fn: (deps: Dependencies) => Promise<Result>) => Promise<Result>;

export function createTransactionRunner(dependencies: Dependencies): TransactionRunner {
  return async function $transaction<R>(fn: (d: Dependencies) => Promise<R>) {
    return await dependencies.database.$transaction(
      (db) => {
        const repositories = getRepositories(db);
        const queries = getQueries(db);
        const services = getDomainServices(repositories);

        return fn({
          ...dependencies,
          ...repositories,
          ...queries,
          ...services,
          database: db as any,
        });
      },
      {
        maxWait: 5000, // default: 2000
        timeout: 30000, // default: 5000
      },
    );
  };
}
