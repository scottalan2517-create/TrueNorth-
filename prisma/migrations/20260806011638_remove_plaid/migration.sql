/*
  Warnings:

  - You are about to drop the `LinkedAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlaidItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LinkedAccount" DROP CONSTRAINT "LinkedAccount_plaidItemId_fkey";

-- DropForeignKey
ALTER TABLE "PlaidItem" DROP CONSTRAINT "PlaidItem_userId_fkey";

-- DropTable
DROP TABLE "LinkedAccount";

-- DropTable
DROP TABLE "PlaidItem";

-- DropEnum
DROP TYPE "PlaidItemStatus";
