/*
  Warnings:

  - You are about to alter the column `messageSequence` on the `Conversation` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `sequence` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "messageSequence" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "sequence" SET DATA TYPE INTEGER;
