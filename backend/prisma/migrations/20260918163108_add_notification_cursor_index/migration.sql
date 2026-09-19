/*
  Warnings:

  - A unique constraint covering the columns `[createdAt,id]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "conversationId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_createdAt_id_key" ON "Notification"("createdAt", "id");
