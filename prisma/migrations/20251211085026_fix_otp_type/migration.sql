/*
  Warnings:

  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `otp` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otpExpiry` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp" INTEGER NOT NULL,
ADD COLUMN     "otpExpiry" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "posts";

-- CreateTable
CREATE TABLE "tc" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "tc_pkey" PRIMARY KEY ("id")
);
