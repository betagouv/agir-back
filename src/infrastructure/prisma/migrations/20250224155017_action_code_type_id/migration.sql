/*
  Warnings:

  - A unique constraint covering the columns `[code_type_id]` on the table `Action` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "code_type_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Action_code_type_id_key" ON "Action"("code_type_id");
