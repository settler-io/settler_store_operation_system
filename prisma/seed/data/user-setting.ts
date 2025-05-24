import { createId } from "@/domain/entity";
import { userSeed } from "./user";

const imageUrl1 =
  "https://d2zsxcb1sxm997.cloudfront.net/uploads/user_profile/image/19230/thumb_a8d8a292-54bb-44c6-9fb8-894bcb60de69.jpeg";
const imageUrl2 =
  "https://d2zsxcb1sxm997.cloudfront.net/uploads/user_profile/image/7829/thumb_39386f58-4b80-4e5a-8500-00305fcc7387.jpeg";
const imageUrl3 = "https://game-room.imgix.net/17773/thumb_58ca88f2-0386-485c-92f2-f39852b9ffd8.jpg";

export const userSettingSeed = [
  {
    id: createId(),
    userId: userSeed["dev1"].id,
    price: 0,
    withFace: true,
    imageUrl: imageUrl1,
    discordId: "@hostdiscord",
    profile: "私はゲムチャホストやります！！",
    isHost: true,
    hostAt: new Date("2022-01-02"),
  },
  {
    id: createId(),
    userId: userSeed["host1"].id,
    price: 0,
    withFace: true,
    imageUrl: imageUrl2,
    discordId: "@hostdiscord",
    profile: "私はゲムチャホストやります！！",
    isHost: true,
    hostAt: new Date("2022-01-02"),
  },
  {
    id: createId(),
    userId: userSeed["host2"].id,
    price: 0,
    withFace: true,
    imageUrl: imageUrl3,
    discordId: "@hostdiscord",
    profile: "私はゲムチャホストやります！！",
    isHost: true,
    hostAt: new Date("2022-01-02"),
  },
];
