/*
  Warnings:

  - You are about to drop the `Upgrade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Upgrade` DROP FOREIGN KEY `Upgrade_userId_fkey`;

-- AlterTable
ALTER TABLE `Schedule` ADD COLUMN `canCrimeAt` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `canRescueAt` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `canSacrificeAt` BIGINT NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE `Upgrade`;
