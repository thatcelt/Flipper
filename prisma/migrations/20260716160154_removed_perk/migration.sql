/*
  Warnings:

  - The values [STRENGTH] on the enum `Stats_perk` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Stats` MODIFY `perk` ENUM('DECK', 'ICE') NULL;
