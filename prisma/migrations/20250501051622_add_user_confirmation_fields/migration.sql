-- AlterTable
ALTER TABLE "User" ADD COLUMN "activateCode" TEXT;
ALTER TABLE "User" ADD COLUMN "activatedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "recoverCode" TEXT;
