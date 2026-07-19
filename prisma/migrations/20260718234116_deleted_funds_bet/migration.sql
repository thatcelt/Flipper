/*
  Warnings:

  - You are about to drop the column `bet` on the `Clan` table. All the data in the column will be lost.
  - You are about to drop the `Funds` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `icon` to the `Clan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Funds` DROP FOREIGN KEY `Funds_clanId_fkey`;

-- AlterTable
ALTER TABLE `Clan` DROP COLUMN `bet`,
    ADD COLUMN `icon` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Funds`;
