import { getExternalApis } from "./external-apis";
import { getRepositories } from "./repositories";
import { getDomainServices } from "./services";
import type { Dependencies } from "./types";

export function getDependencies(): Dependencies {
  const externalApis = getExternalApis();
  const repositories = getRepositories(externalApis.database);
  const services = getDomainServices(repositories);

  return {
    ...externalApis,
    ...repositories,
    ...services,
  };
}
