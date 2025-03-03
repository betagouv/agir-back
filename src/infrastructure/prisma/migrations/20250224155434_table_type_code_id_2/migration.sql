/*
  Warnings:

  - You are about to drop the column `code_type_id` on the `Action` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[type_code_id]` on the table `Action` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Action_code_type_id_key";

-- AlterTable
ALTER TABLE "Action" DROP COLUMN "code_type_id",
ADD COLUMN     "type_code_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Action_type_code_id_key" ON "Action"("type_code_id");
