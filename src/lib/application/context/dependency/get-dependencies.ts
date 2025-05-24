import { getExternalApis } from "./external-apis";
import { getQueries } from "./queries";
import { getRepositories } from "./repositories";
import { getDomainServices } from "./services";
import type { Dependencies } from "./types";

export function getDependencies(): Dependencies {
  const externalApis = getExternalApis();
  const repositories = getRepositories(externalApis.database);
  const queries = getQueries(externalApis.database);
  const services = getDomainServices(repositories);

  return {
    ...externalApis,
    ...repositories,
    ...queries,
    ...services,
  };
}
