/*
  Warnings:

  - The values [COMMENT] on the enum `Subscription_targetType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Subscription` MODIFY `targetType` ENUM('POST', 'USER') NOT NULL;
