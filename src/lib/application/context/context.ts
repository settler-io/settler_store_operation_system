import { getDependencies, type Dependencies } from "./dependency";
import { createTransactionRunner, type TransactionRunner } from "./transaction-runner";

export type ServerContext = Dependencies & {
  $transaction: TransactionRunner;
  sessionUserId: string;
};

export async function getServerContext(): Promise<ServerContext> {
  const dependencies = getOrCreateDependencies();
  const transactionRunner = createTransactionRunner(dependencies);
  const sessionUserId = "";

  return {
    ...dependencies,
    $transaction: transactionRunner,
    sessionUserId,
  };
}

let dependencies: Dependencies | null = null;
function getOrCreateDependencies() {
  if (dependencies) {
    return dependencies;
  }

  return (dependencies = getDependencies());
}
