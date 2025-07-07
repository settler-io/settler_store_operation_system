-- CreateTable
CREATE TABLE `transaction` (
    `id` CHAR(32) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `total` INTEGER NOT NULL DEFAULT 0,
    `total_reduced` INTEGER NOT NULL DEFAULT 0,
    `tax` INTEGER NOT NULL DEFAULT 0,
    `tax_internal` INTEGER NOT NULL DEFAULT 0,
    `tax_reduced` INTEGER NOT NULL DEFAULT 0,
    `tax_reduced_internal` INTEGER NOT NULL DEFAULT 0,
    `discount` INTEGER NOT NULL DEFAULT 0,
    `entry_time` DATETIME(3) NOT NULL,
    `out_time` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `transaction_entry_time_out_time_idx`(`entry_time`, `out_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_history` (
    `id` CHAR(64) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `transaction_id` CHAR(32) NOT NULL,
    `line_user_id` CHAR(64) NOT NULL,
    `line_user_name` CHAR(64) NOT NULL,
    `order_type` CHAR(16) NOT NULL,
    `ordered_time` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_history_ordered_time_idx`(`ordered_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_item` (
    `id` CHAR(32) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `order_history_id` CHAR(64) NOT NULL,
    `menu_id` INTEGER NOT NULL DEFAULT 0,
    `name` CHAR(32) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `price` INTEGER NOT NULL DEFAULT 0,
    `unit_price` INTEGER NOT NULL DEFAULT 0,
    `timecharge_minutes` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order_history` ADD CONSTRAINT `order_history_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transaction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_order_history_id_fkey` FOREIGN KEY (`order_history_id`) REFERENCES `order_history`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
