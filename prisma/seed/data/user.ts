import { User } from "@/domain/entity";

export const userSeed = {
  // ログインして開発するために使う
  dev1: {
    id: "matsumoto0123456",
    email: "matsumoto@settler.cc",
    password: "6ab5945a2d87f8a3fc02d125eac9b9001a39723b22ac123dbe06a693312738b3", // password
    nickname: "matsumoto",
    pointBalance: 0,
    status: User.statuses.privateInformationRegistered,
  },
  host1: {
    id: "matsumoto0000001",
    email: "matsumoto+host1@settler.cc",
    password: "2ef81fe89852c92a4c1f3210b77932e2fc185c661bec12038e03bdb4008864cc", // password
    nickname: "未月リシア🌱",
    pointBalance: 0,
    status: User.statuses.privateInformationRegistered,
  },
  host2: {
    id: "matsumoto0000002",
    email: "matsumoto+host2@settler.cc",
    password: "2ef81fe89852c92a4c1f3210b77932e2fc185c661bec12038e03bdb4008864cc", // password
    nickname: "華雫(しずく)",
    pointBalance: 0,
    status: User.statuses.privateInformationRegistered,
  },
} as const;
