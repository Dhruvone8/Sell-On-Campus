/*
  Warnings:

  - A unique constraint covering the columns `[updatedAt,id]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Conversation_updatedAt_id_key" ON "Conversation"("updatedAt", "id");
