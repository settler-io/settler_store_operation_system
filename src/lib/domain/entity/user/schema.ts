import { z } from "zod";
import { ID_SCHEMA, VERSION_SCHEMA } from "../common";

export const USER_STATUS = {
  // Email登録された状態
  emailRegistered: "email_registered",
  // OAuthで登録後、Email認証が完了していない状態
  emailUnverified: "email_unverified",
  // Email登録後、認証が完了した状態
  emailVerified: "email_verified",
  // Email認証後、個人情報の登録が完了した状態
  privateInformationRegistered: "private_information_registered",
};

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

// TODO: production環境の構築後に変更する
export const DEFAULT_USER_IMAGE =
  "https://496217581614-gemucha-app-storage.s3.ap-northeast-1.amazonaws.com/user-image/default.png";

export const USER_SCHEMA = {
  id: ID_SCHEMA,
  version: VERSION_SCHEMA,
  email: z.string().email(),
  password: z.string().length(64), // hashされた値
  passwordInput: z.string().min(8), // hash前のユーザ入力
  nickname: z.string().min(1).max(16),
  imageUrl: z.string().url(),
  pointBalance: z.number().min(0),
  status: z.enum([...Object.values(USER_STATUS)] as [UserStatus]),
} as const;
