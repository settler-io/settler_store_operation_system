import { getNextAuthOptions } from "@/application/auth";
import { getServerContext } from "@/application/context";
import { PageUrl } from "@/application/url";
import { DatabaseAdapter, PasswordProvider } from "@/infra/auth";
import NextAuth from "next-auth";
import type { NextRequest } from "next/server";

async function handler(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  const { database, userRepository, passwordService } = await getServerContext();

  return NextAuth(req, ctx, {
    ...getNextAuthOptions(),
    adapter: DatabaseAdapter(database),
    providers: [PasswordProvider(userRepository, passwordService)],
    pages: {
      signIn: PageUrl.auth.signinTop,
      newUser: PageUrl.top,
      error: PageUrl.auth.signinTop,
    },
  });
}

export { handler as GET, handler as POST };
