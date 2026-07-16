/*
  Warnings:

  - You are about to drop the column `strength` on the `Stats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Stats` DROP COLUMN `strength`;

-- AlterTable
ALTER TABLE `User` MODIFY `background` VARCHAR(191) NOT NULL DEFAULT 'default';
