import { config } from "@/application/config";
import { EmailVerificationTokenService, PasswordService, UserService } from "@/domain/service";
import type { Repositories } from "./repositories";

export function getDomainServices(repositories: Repositories) {
  const passwordService = new PasswordService(config.masterPassword);
  const userService = new UserService(repositories.userRepository, passwordService);
  const emailVerificationTokenService = new EmailVerificationTokenService(
    repositories.emailVerificationTokenRepository,
  );

  return {
    userService,
    passwordService,
    emailVerificationTokenService,
  } as const;
}

export type DomainServices = ReturnType<typeof getDomainServices>;
