/*
  Warnings:

  - A unique constraint covering the columns `[conversationId,sequence]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sequence` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "messageSequence" BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "sequence" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Message_conversationId_sequence_key" ON "Message"("conversationId", "sequence");
