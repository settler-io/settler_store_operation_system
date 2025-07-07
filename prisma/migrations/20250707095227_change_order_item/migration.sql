-- AlterTable
ALTER TABLE `order_item` MODIFY `menu_id` CHAR(64) NOT NULL;

-- CreateTable
CREATE TABLE `ring_result` (
    `id` INTEGER NOT NULL,
    `version` INTEGER NOT NULL,
    `myId` CHAR(64) NOT NULL,
    `nickname` CHAR(64) NOT NULL,
    `storeName` CHAR(64) NOT NULL,
    `status` INTEGER NOT NULL,
    `checkIn` DATETIME(3) NOT NULL,
    `checkOut` DATETIME(3) NOT NULL,
    `buyIn` INTEGER NOT NULL,
    `cashOut` INTEGER NOT NULL,
    `rate` CHAR(64) NOT NULL,
    `playingTime` DECIMAL(65, 30) NOT NULL,
    `result` DECIMAL(65, 30) NOT NULL,
    `resultBB` DECIMAL(65, 30) NOT NULL,
    `netResult` INTEGER NOT NULL,
    `netResultBB` DECIMAL(65, 30) NOT NULL,
    `totalPlayingTime` DECIMAL(65, 30) NOT NULL,
    `adjustedResult` DECIMAL(65, 30) NOT NULL,
    `adjustedNetResult` DECIMAL(65, 30) NOT NULL,
    `adjustedNetResultBB` DECIMAL(65, 30) NOT NULL,
    `adjustedHourlyWage` DECIMAL(65, 30) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
