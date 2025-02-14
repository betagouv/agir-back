/*
  Warnings:

  - The primary key for the `Action` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[code,type]` on the table `Action` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cms_id,type]` on the table `Action` will be added. If there are existing duplicate values, this will fail.
  - Made the column `cms_id` on table `Action` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Action_cms_id_key";

-- AlterTable
ALTER TABLE "Action" DROP CONSTRAINT "Action_pkey",
ALTER COLUMN "cms_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Action_code_type_key" ON "Action"("code", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Action_cms_id_type_key" ON "Action"("cms_id", "type");
