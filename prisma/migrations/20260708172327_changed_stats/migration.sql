/*
  Warnings:

  - You are about to drop the column `hacks` on the `Stats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Stats` DROP COLUMN `hacks`,
    MODIFY `deck` INTEGER NOT NULL DEFAULT 1,
    MODIFY `ice` INTEGER NOT NULL DEFAULT 1;
