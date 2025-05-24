import type { ExternalApis } from "./external-apis";
import type { Queries } from "./queries";
import type { Repositories } from "./repositories";
import type { DomainServices } from "./services";

export type Dependencies = ExternalApis & Repositories & Queries & DomainServices;
