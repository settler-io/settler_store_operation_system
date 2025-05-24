import { createId, User } from "@/domain/entity";
import type { PrismaClient, User as PrismaUser } from "@prisma/client";
import type { Adapter, AdapterUser } from "next-auth/adapters";

/**
 * NextAuth.jsで使用するAdapter
 */
export function DatabaseAdapter(db: PrismaClient) {
  return {
    async createUser(args) {
      // Emailが未登録の状態でGoogle/LINE連携をした場合はcreate
      // 既にEmailで登録済みの上、さらにGoogle/LINE連携をした場合はupdate
      // Google/LINEはメール認証が確実にされているためこのような処理で問題ないが、
      // 他のSNSでメール認証が確実にされていないような場合は、このような処理をするとEmailで登録したアカウントの乗っ取りが発生するリスクがあるため注意
      const hasEmailVerified = Boolean(args.email);

      const user = await db.user.upsert({
        create: {
          id: createId(),
          email: hasEmailVerified ? args.email : null,
          status: hasEmailVerified ? User.statuses.emailVerified : User.statuses.emailUnverified,
        },
        // 既にデータがある場合、何もしない
        update: {},
        where: {
          email: args.email ?? "",
        },
      });

      return toAdapterUser(user);
    },

    async getUser(id) {
      const user = await db.user.findUnique({
        where: {
          id: id,
        },
      });

      return user ? toAdapterUser(user) : null;
    },

    async getUserByEmail() {
      // NextAuthはセキュリティのために、OAuthでアカウント作成する際に既にEmailの登録がある場合はエラーとされる
      // このアプリではメールアドレスが信頼できるGoogleだけしかOAuth出来ないようにしているため、このバリデーションは不要
      // この処理でnullが返されると、linkAccountで紐付け処理が行われる
      return null;
    },

    async getUserByAccount(args) {
      const providerIdKey = getProviderAccountIdKey(args.provider);

      const user = await db.user.findFirst({
        where: {
          [providerIdKey]: args.providerAccountId,
        },
      });

      return user ? toAdapterUser(user) : null;
    },

    async linkAccount(args) {
      const providerIdKey = getProviderAccountIdKey(args.provider);

      await db.user.update({
        where: {
          id: args.userId,
        },
        data: {
          [providerIdKey]: args.providerAccountId,
        },
      });

      return args;
    },
    async updateUser() {
      throw new Error("Adapter.updateUser must not be used unless email provider enabled");
    },
    async createSession() {
      throw new Error("Adapter.createSession must not be used if jwt enabled");
    },
    async getSessionAndUser() {
      throw new Error("Adapter.getSessionAndUser must not be used if jwt enabled");
    },
    async updateSession() {
      throw new Error("Adapter.updateSession must not be used if jwt enabled");
    },
    async deleteSession() {
      throw new Error("Adapter.deleteSession must not be used if jwt enabled");
    },
  } as const satisfies Adapter;
}

function toAdapterUser(user: PrismaUser): AdapterUser {
  return {
    id: String(user.id),
    email: user.email ?? "",
    emailVerified: null,
  };
}

function getProviderAccountIdKey(provider: string) {
  switch (provider) {
    case "google": {
      return "googleAccountId";
    }
    case "line": {
      return "lineAccountId";
    }
    default: {
      throw new Error(`Provider not supported. provider=${provider}`);
    }
  }
}
