import { createId } from "@/domain/entity";
import { userSeed } from "./user";

const imageUrl1 =
  "https://d2zsxcb1sxm997.cloudfront.net/uploads/user_profile/image/19230/thumb_a8d8a292-54bb-44c6-9fb8-894bcb60de69.jpeg";
const imageUrl2 =
  "https://d2zsxcb1sxm997.cloudfront.net/uploads/user_profile/image/7829/thumb_39386f58-4b80-4e5a-8500-00305fcc7387.jpeg";
const imageUrl3 = "https://game-room.imgix.net/17773/thumb_58ca88f2-0386-485c-92f2-f39852b9ffd8.jpg";
const imageUrl4 = "https://game-room.imgix.net/21075/thumb_1258f57e-2493-42b9-852d-13354e65e4e9.jpg";
const imageUrl5 = "https://game-room.imgix.net/22204/thumb_6704543c-3656-48ce-a119-cccbb7ff6d50.jpeg";
const imageUrl6 = "https://game-room.imgix.net/22942/thumb_1820807c-7221-4917-8690-f6b23efaa576.jpeg";

export const hostImageSeed = [
  {
    id: createId(),
    userId: userSeed["host1"].id,
    imageUrl: imageUrl1,
  },
  {
    id: createId(),
    userId: userSeed["dev1"].id,
    imageUrl: imageUrl2,
  },
  {
    id: createId(),
    userId: userSeed["dev1"].id,
    imageUrl: imageUrl3,
  },
  {
    id: createId(),
    userId: userSeed["dev1"].id,
    imageUrl: imageUrl4,
  },
  {
    id: createId(),
    userId: userSeed["dev1"].id,
    imageUrl: imageUrl5,
  },
  {
    id: createId(),
    userId: userSeed["dev1"].id,
    imageUrl: imageUrl6,
  },
];
