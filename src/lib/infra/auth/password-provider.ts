import { PasswordService } from "@/domain/service";
import CredentialsProvider from "next-auth/providers/credentials";
import type { UserRepository } from "../repository";

export function PasswordProvider(repository: UserRepository, passwordService: PasswordService) {
  return CredentialsProvider({
    name: "password",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "text" },
    },
    async authorize(credentials) {
      try {
        const user = await repository.findByEmail(String(credentials?.email));

        // Email未検証、BANや退会済みなどログイン出来ないユーザの場合
        if (!user.canLogin) {
          return null;
        }

        // パスワードの検証
        await passwordService.verifyPassword(user.password, String(credentials?.password), user.passwordSalt);

        return {
          id: user.id,
          email: user.email,
        };
      } catch (e) {
        // NextAuthの仕様で、該当ユーザが存在しない場合、またエラーが発生した場合はnullを返す
        // nullが返された場合、redirectのパラメータに応じて以下の結果がクライアントに返却される
        //   - redirect=falseの場合
        //     - POSTリクエストの結果として、{"url": "/api/auth/error?error=CredentialsSignin&provider=credentials"} が返却される
        //   - redirect=trueの場合
        //     - /auth/signin?error=CredentialsSignin のページへリダイレクトされる
        return null;
      }
    },
  });
}
