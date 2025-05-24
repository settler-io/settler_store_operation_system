-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(16) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `email` VARCHAR(191) NULL,
    `password` CHAR(64) NULL,
    `image_url` VARCHAR(191) NULL,
    `nickname` VARCHAR(16) NULL,
    `point_balance` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_verification_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `user_id` CHAR(16) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `point_history` (
    `id` CHAR(16) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `user_id` CHAR(16) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `cause` VARCHAR(191) NOT NULL,
    `purchased_amount` INTEGER NULL,
    `changes` INTEGER NOT NULL,
    `balance` INTEGER UNSIGNED NOT NULL,
    `executed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `point_history_user_id_executed_at_idx`(`user_id`, `executed_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_setting` (
    `id` CHAR(16) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `user_id` CHAR(16) NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,
    `with_face` BOOLEAN NOT NULL,
    `image_url` VARCHAR(191) NULL,
    `profile` VARCHAR(500) NULL,
    `discord_id` VARCHAR(50) NULL,
    `is_host` BOOLEAN NOT NULL DEFAULT false,
    `host_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_setting_is_host_host_at_idx`(`is_host`, `host_at`),
    UNIQUE INDEX `user_setting_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_game` (
    `id` CHAR(16) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `user_id` CHAR(16) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `host_image` (
    `id` CHAR(16) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `user_id` CHAR(16) NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservation` (
    `id` CHAR(16) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `host_user_id` CHAR(16) NOT NULL,
    `guest_user_id` CHAR(16) NOT NULL,
    `start_at` DATETIME(3) NOT NULL,
    `end_at` DATETIME(3) NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,
    `game` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reservation_host_user_id_start_at_idx`(`host_user_id`, `start_at`),
    INDEX `reservation_guest_user_id_start_at_idx`(`guest_user_id`, `start_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `view_history` (
    `id` CHAR(16) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `view_user_id` CHAR(16) NOT NULL,
    `viewed_user_id` CHAR(16) NOT NULL,
    `view_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `view_history_view_user_id_view_at_idx`(`view_user_id`, `view_at`),
    INDEX `view_history_viewed_user_id_view_at_idx`(`viewed_user_id`, `view_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attraction` (
    `id` CHAR(16) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `user_id` CHAR(16) NOT NULL,
    `message` VARCHAR(140) NOT NULL,
    `start_at` DATETIME(3) NOT NULL,
    `end_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `attraction_user_id_start_at_idx`(`user_id`, `start_at`),
    INDEX `attraction_start_at_idx`(`start_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation` (
    `id` CHAR(16) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `reservation_id` CHAR(16) NOT NULL,
    `side` VARCHAR(10) NOT NULL,
    `evaluate_user_id` CHAR(16) NOT NULL,
    `evaluated_user_id` CHAR(16) NOT NULL,
    `score` INTEGER UNSIGNED NOT NULL,
    `comment` VARCHAR(140) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `evaluation_side_evaluate_user_id_idx`(`side`, `evaluate_user_id`),
    INDEX `evaluation_side_evaluated_user_id_idx`(`side`, `evaluated_user_id`),
    UNIQUE INDEX `evaluation_reservation_id_evaluate_user_id_evaluated_user_id_key`(`reservation_id`, `evaluate_user_id`, `evaluated_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat` (
    `id` CHAR(16) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `send_user_id` CHAR(16) NOT NULL,
    `receive_user_id` CHAR(16) NOT NULL,
    `comment` VARCHAR(300) NOT NULL,
    `send_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chat_send_user_id_receive_user_id_idx`(`send_user_id`, `receive_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `email_verification_tokens` ADD CONSTRAINT `email_verification_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `point_history` ADD CONSTRAINT `point_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_setting` ADD CONSTRAINT `user_setting_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_game` ADD CONSTRAINT `user_game_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `host_image` ADD CONSTRAINT `host_image_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_host_user_id_fkey` FOREIGN KEY (`host_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_guest_user_id_fkey` FOREIGN KEY (`guest_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `view_history` ADD CONSTRAINT `view_history_view_user_id_fkey` FOREIGN KEY (`view_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `view_history` ADD CONSTRAINT `view_history_viewed_user_id_fkey` FOREIGN KEY (`viewed_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attraction` ADD CONSTRAINT `attraction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluation` ADD CONSTRAINT `evaluation_reservation_id_fkey` FOREIGN KEY (`reservation_id`) REFERENCES `reservation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluation` ADD CONSTRAINT `evaluation_evaluate_user_id_fkey` FOREIGN KEY (`evaluate_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluation` ADD CONSTRAINT `evaluation_evaluated_user_id_fkey` FOREIGN KEY (`evaluated_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat` ADD CONSTRAINT `chat_send_user_id_fkey` FOREIGN KEY (`send_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat` ADD CONSTRAINT `chat_receive_user_id_fkey` FOREIGN KEY (`receive_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
