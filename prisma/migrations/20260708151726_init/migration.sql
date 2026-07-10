-- CreateTable
CREATE TABLE `Funds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `balance` INTEGER NOT NULL DEFAULT 0,
    `clanId` INTEGER NOT NULL,

    UNIQUE INDEX `Funds_id_key`(`id`),
    UNIQUE INDEX `Funds_clanId_key`(`clanId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Clan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `experience` INTEGER NOT NULL DEFAULT 0,
    `chatLink` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `background` VARCHAR(191) NOT NULL DEFAULT 'default',
    `frame` VARCHAR(191) NOT NULL DEFAULT 'orange',
    `bet` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Clan_id_key`(`id`),
    UNIQUE INDEX `Clan_ownerId_key`(`ownerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Couple` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` BIGINT NOT NULL,
    `background` VARCHAR(191) NOT NULL DEFAULT 'default',
    `frame` VARCHAR(191) NOT NULL DEFAULT 'orange',
    `canKissAt` BIGINT NOT NULL DEFAULT 0,
    `lastKissAt` BIGINT NOT NULL DEFAULT 0,
    `kissStreak` INTEGER NOT NULL DEFAULT 0,
    `experience` INTEGER NOT NULL DEFAULT 0,
    `kissesAmount` INTEGER NOT NULL DEFAULT 0,
    `lastStreakAt` BIGINT NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Upgrade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `upgradeAt` BIGINT NOT NULL DEFAULT 0,
    `type` ENUM('STRENGTH', 'DECK', 'ICE', 'PRESTIGE', 'NOTHING') NOT NULL DEFAULT 'NOTHING',
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Upgrade_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `canWorkAt` BIGINT NOT NULL DEFAULT 0,
    `canDailyAt` BIGINT NOT NULL DEFAULT 0,
    `canRobAt` BIGINT NOT NULL DEFAULT 0,
    `canDuelAt` BIGINT NOT NULL DEFAULT 0,
    `canHackAt` BIGINT NOT NULL DEFAULT 0,
    `canRepAt` BIGINT NOT NULL DEFAULT 0,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Schedule_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductsOnUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Card` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `initials` VARCHAR(191) NOT NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `cash` DOUBLE NOT NULL DEFAULT 0,
    `color` VARCHAR(191) NOT NULL DEFAULT 'gradient',
    `ownerId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Card_ownerId_key`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `experience` INTEGER NOT NULL DEFAULT 0,
    `reputation` INTEGER NOT NULL DEFAULT 0,
    `messages` INTEGER NOT NULL DEFAULT 0,
    `robs` INTEGER NOT NULL DEFAULT 0,
    `duels` INTEGER NOT NULL DEFAULT 0,
    `hacks` INTEGER NOT NULL DEFAULT 0,
    `deck` INTEGER NOT NULL DEFAULT 0,
    `ice` INTEGER NOT NULL DEFAULT 0,
    `prestige` INTEGER NOT NULL DEFAULT 0,
    `strength` INTEGER NOT NULL DEFAULT 1,
    `userId` VARCHAR(191) NOT NULL,
    `perk` ENUM('STRENGTH', 'DECK', 'ICE') NULL,

    UNIQUE INDEX `Stats_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `background` VARCHAR(191) NOT NULL DEFAULT 'default',
    `frame` VARCHAR(191) NOT NULL DEFAULT 'orange',
    `coupleId` INTEGER NULL,
    `clanId` INTEGER NULL,

    UNIQUE INDEX `User_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Funds` ADD CONSTRAINT `Funds_clanId_fkey` FOREIGN KEY (`clanId`) REFERENCES `Clan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Upgrade` ADD CONSTRAINT `Upgrade_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductsOnUser` ADD CONSTRAINT `ProductsOnUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stats` ADD CONSTRAINT `Stats_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_coupleId_fkey` FOREIGN KEY (`coupleId`) REFERENCES `Couple`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_clanId_fkey` FOREIGN KEY (`clanId`) REFERENCES `Clan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
